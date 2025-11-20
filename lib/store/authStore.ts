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
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      hasHydrated: false, // ← ADD

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
        user: state.user,
        isAuthenticated: state.user ? true : false,
      }),

      onRehydrateStorage: () => state => {
        if (!state) return;

        state.setLoading(true);

        // Коли hydration завершився → виставляємо прапор
        setTimeout(() => {
          state.hasHydrated = true;
          state.setLoading(false);
        }, 0);
      },
    }
  )
);

// Селектори для оптимізації ре-рендерів
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);

export const useUser = () => useAuthStore(state => state.user);

export const useIsLoading = () => useAuthStore(state => state.isLoading);
