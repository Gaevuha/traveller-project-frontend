'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api/clientApi';

type Props = {
  children: React.ReactNode;
  initialUser?: User | null;
};

const AuthProvider = ({ children, initialUser = null }: Props) => {
  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated
  );
  const setLoading = useAuthStore(state => state.setLoading);
  const user = useAuthStore(state => state.user);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (isInitialized) return;

      setLoading(true);

      // Якщо є initialUser з SSR - використовуємо його
      if (initialUser) {
        setUser(initialUser);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Якщо initialUser є null, але є user в store (з localStorage) - перевіряємо сесію
      if (user) {
        try {
          // Перевіряємо, чи сесія все ще активна
          const currentUser = await getMe(true); // silent: true - не логуємо помилки
          if (currentUser) {
            // Сесія активна - оновлюємо дані
            setUser(currentUser);
          } else {
            // Сесія неактивна - очищаємо
            clearIsAuthenticated();
          }
        } catch {
          // Помилка при перевірці - очищаємо
          clearIsAuthenticated();
        }
      } else {
        // Немає ні initialUser, ні user в store - очищаємо
        clearIsAuthenticated();
      }

      setLoading(false);
      setIsInitialized(true);
    };

    fetchSession();
  }, [
    initialUser,
    clearIsAuthenticated,
    setUser,
    setLoading,
    isInitialized,
    user,
  ]);

  return <>{children}</>;
};

export default AuthProvider;
