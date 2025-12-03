// lib/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';

type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      hasHydrated: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      clearIsAuthenticated: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated, isLoading: false });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),

    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({
        user: state.user,
        isAuthenticated: state.user ? true : false,
      }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (state) {
            setTimeout(() => {
              state.setHasHydrated(true);
            }, 0);
          }
        };
      },
    }
  )
);

// Додайте також цей хук для спрощеного доступу до стану
export const useAuthHydration = () => {
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const user = useAuthStore(state => state.user);

  // hasHydrated автоматично стає true при першому рендері з user
  const isReady = hasHydrated || user !== undefined;

  return isReady;
};
