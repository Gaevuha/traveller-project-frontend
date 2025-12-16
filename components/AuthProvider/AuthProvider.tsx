'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';

import { useAuthStore } from '@/lib/store/authStore';
import { getMe, refreshSession } from '@/lib/api/clientApi';
import { User } from '@/types/user';

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

  // 🔒 гарантія одноразової ініціалізації
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      setLoading(true);

      // 🔥 1️⃣ ПРОГРІВ BACKEND (НЕ КРИТИЧНИЙ)
      try {
        await axios.get('/api/health');
      } catch {
        // Render може прокидатися — і це ОК
      }

      // 🔐 2️⃣ AUTH LOGIC
      try {
        // SSR user має найвищий пріоритет
        if (initialUser) {
          setUser(initialUser);
          return;
        }

        // Якщо є user у store — перевіряємо сесію
        if (user) {
          const me = await getMe(true);
          if (me) {
            setUser(me);
            return;
          }

          // Пробуємо refresh
          const refreshed = await refreshSession();
          if (refreshed) {
            const retried = await getMe(true);
            if (retried) {
              setUser(retried);
              return;
            }
          }
        }

        // Якщо нічого не спрацювало
        clearIsAuthenticated();
      } catch {
        clearIsAuthenticated();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [initialUser, user, setUser, setLoading, clearIsAuthenticated]);

  return <>{children}</>;
};

export default AuthProvider;
