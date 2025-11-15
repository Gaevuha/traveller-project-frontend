import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';

type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      clearIsAuthenticated: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        isAuthenticated: state.user ? true : false,
        user: state.user,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          // Встановлюємо isLoading: true після відновлення
          state.setLoading(true);

          if (state.user) {
            // Перевіряємо, чи user - це об'єкт User, а не API response
            const userData = state.user as unknown;

            // Функція для перевірки, чи це валідний User об'єкт
            const isValidUser = (obj: unknown): obj is User => {
              return (
                obj !== null &&
                typeof obj === 'object' &&
                '_id' in obj &&
                'name' in obj &&
                typeof (obj as { _id: unknown })._id === 'string' &&
                typeof (obj as { name: unknown }).name === 'string'
              );
            };

            // Якщо це API response з структурою { status, message, data }
            if (
              userData &&
              typeof userData === 'object' &&
              'status' in userData &&
              'data' in userData
            ) {
              const responseData = userData as { data: unknown };
              // Витягуємо user з data
              if (isValidUser(responseData.data)) {
                state.user = responseData.data;
                console.log(
                  '✅ Виправлено user з API response:',
                  state.user.name
                );
              } else {
                // Якщо не вдалося витягнути - очищаємо
                console.warn(
                  '⚠️ Не вдалося витягнути user з API response, очищаємо'
                );
                state.user = null;
              }
            } else if (!isValidUser(userData)) {
              // Якщо не валідний User - очищаємо
              console.warn('⚠️ User не валідний, очищаємо:', userData);
              state.user = null;
            }

            // Якщо є валідний user в localStorage, встановлюємо isAuthenticated: true
            if (state.user && isValidUser(state.user)) {
              state.isAuthenticated = true;
            } else {
              state.isAuthenticated = false;
              state.user = null;
            }
          } else {
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

// Селектори для оптимізації ре-рендерів
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);

export const useUser = () => useAuthStore(state => state.user);

export const useIsLoading = () => useAuthStore(state => state.isLoading);
