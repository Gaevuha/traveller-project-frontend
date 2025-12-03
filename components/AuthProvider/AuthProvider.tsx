'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { getMe, refreshSession } from '@/lib/api/clientApi';

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

      console.log('🔐 AuthProvider: Starting session fetch', {
        hasInitialUser: !!initialUser,
        hasUserInStore: !!user,
        isInitialized,
      });

      setLoading(true);

      // Якщо є initialUser з SSR - використовуємо його
      if (initialUser) {
        console.log('🔐 AuthProvider: Using SSR initialUser');

        // Нормалізуємо користувача
        let normalizedUser: User | null = null;
        const asRecord = initialUser as unknown as Record<string, unknown>;

        if (
          asRecord &&
          typeof asRecord === 'object' &&
          'status' in asRecord &&
          'data' in asRecord
        ) {
          // API відповідь { status, message, data }
          const rawUnknown = (asRecord as { data: unknown }).data;
          if (rawUnknown && typeof rawUnknown === 'object') {
            const raw = rawUnknown as Record<string, unknown>;
            const idFromUnderscore =
              '_id' in raw && typeof raw._id === 'string' ? raw._id : undefined;
            const idFromId =
              'id' in raw && typeof raw.id === 'string' ? raw.id : undefined;
            const resolvedId = idFromUnderscore ?? idFromId;

            normalizedUser = {
              ...(raw as unknown as Omit<User, '_id'>),
              _id: resolvedId ?? '',
            };
          }
        } else {
          // Безпосередньо User об'єкт
          const raw = initialUser as unknown as Record<string, unknown>;
          const idFromUnderscore =
            '_id' in raw && typeof raw._id === 'string' ? raw._id : undefined;
          const idFromId =
            'id' in raw && typeof raw.id === 'string' ? raw.id : undefined;
          const resolvedId = idFromUnderscore ?? idFromId;

          normalizedUser = {
            ...(initialUser as unknown as Omit<User, '_id'>),
            _id: resolvedId ?? '',
          };
        }

        if (normalizedUser && normalizedUser._id) {
          console.log(
            '🔐 AuthProvider: Setting user from SSR',
            normalizedUser._id
          );
          setUser(normalizedUser);
        } else {
          console.log('🔐 AuthProvider: Clearing auth - invalid SSR user');
          clearIsAuthenticated();
        }
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Якщо немає initialUser з SSR
      console.log(
        '🔐 AuthProvider: No SSR user, checking localStorage/session'
      );

      try {
        // Пробуємо отримати поточну сесію
        const currentUser = await getMe(true); // silent: true

        if (currentUser) {
          // Сесія активна
          console.log('🔐 AuthProvider: Active session found', currentUser._id);
          setUser(currentUser);
        } else {
          // Спробуємо оновити сесію
          console.log('🔐 AuthProvider: No active session, trying refresh');
          const refreshed = await refreshSession();

          if (refreshed) {
            const retried = await getMe(true);
            if (retried) {
              console.log('🔐 AuthProvider: Session refreshed', retried._id);
              setUser(retried);
            } else {
              console.log('🔐 AuthProvider: No user after refresh');
              clearIsAuthenticated();
            }
          } else {
            // Немає сесії - очищаємо
            console.log('🔐 AuthProvider: No session, clearing auth');
            clearIsAuthenticated();
          }
        }
      } catch (error) {
        // Помилка при перевірці
        console.error('🔐 AuthProvider: Error checking session', error);
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

  // Логування змін стану
  useEffect(() => {
    console.log('🔐 AuthProvider state:', {
      user: user?._id,
      isInitialized,
      initialUser: initialUser?._id,
    });
  }, [user, isInitialized, initialUser]);

  return <>{children}</>;
};

export default AuthProvider;
