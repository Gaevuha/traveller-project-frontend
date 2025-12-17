'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  saveTheme as saveThemeAPI,
  getTheme as getThemeAPI,
} from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

export default function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  const {
    user,
    hasHydrated,
    isLoading: authLoading,
    updateUserTheme,
  } = useAuthStore();

  const applyTheme = useCallback((value: Theme) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
    setThemeState(value);
  }, []);

  const setTheme = useCallback(
    async (value: Theme) => {
      applyTheme(value);

      // Update Zustand
      if (user && updateUserTheme) {
        updateUserTheme(value);
      }

      // Only send to backend if logged in
      if (user) {
        try {
          await saveThemeAPI(value);
        } catch (e) {
          console.error('❌ Failed to save theme to backend:', e);
        }
      }
    },
    [user, updateUserTheme, applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    if (!hasHydrated) return;

    const init = async () => {
      setIsThemeLoading(true);

      let resolvedTheme: Theme = 'light';

      // Local theme
      const localTheme = localStorage.getItem('theme') as Theme | null;
      if (localTheme) resolvedTheme = localTheme;

      // Backend theme for logged-in user
      if (user) {
        try {
          const backendTheme = await getThemeAPI();
          if (backendTheme) resolvedTheme = backendTheme;
        } catch {
          console.warn('⚠️ Backend theme not available');
        }
      }

      applyTheme(resolvedTheme);
      setIsThemeLoading(false);
    };

    init();
  }, [hasHydrated, user, applyTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      isLoading: isThemeLoading || authLoading || !hasHydrated,
    }),
    [theme, toggleTheme, setTheme, isThemeLoading, authLoading, hasHydrated]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
