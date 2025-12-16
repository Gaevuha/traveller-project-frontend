'use client';

import { useEffect, useState } from 'react';
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

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
      setLoading(true);

      // 🔥 1️⃣ ПРОГРІВ BACKEND (Render)
      try {
        await axios.get('/api/health');
      } catch {
        // backend може прокидатися — це ОК
      }

      // 🔐 2️⃣ AUTH LOGIC
      try {
        if (initialUser) {
          setUser(initialUser);
          return;
        }

        if (user) {
          const me = await getMe(true);
          if (me) {
            setUser(me);
            return;
          }

          const refreshed = await refreshSession();
          if (refreshed) {
            const retried = await getMe(true);
            if (retried) {
              setUser(retried);
              return;
            }
          }
        }

        clearIsAuthenticated();
      } catch {
        clearIsAuthenticated();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [
    isInitialized,
    initialUser,
    user,
    setUser,
    setLoading,
    clearIsAuthenticated,
  ]);

  return <>{children}</>;
};

export default AuthProvider;
