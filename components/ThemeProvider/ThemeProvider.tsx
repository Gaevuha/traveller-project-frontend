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

import { getThemeFromBackend, saveThemeToBackend } from '@/lib/api/clientApi';
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

type Props = {
  children: ReactNode;
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

export default function ThemeProvider({ children }: Props) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  const { user, hasHydrated, isLoading: authLoading } = useAuthStore();

  /**
   * 🔹 ІНІЦІАЛІЗАЦІЯ ТЕМИ
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const initTheme = async () => {
      setIsLoading(true);

      // ❌ НЕ АВТОРИЗОВАНИЙ → ТІЛЬКИ LIGHT
      if (!user) {
        applyTheme('light');
        setThemeState('light');
        setIsLoading(false);
        return;
      }

      // ✅ АВТОРИЗОВАНИЙ → БЕКЕНД
      try {
        const backendTheme = await getThemeFromBackend();
        applyTheme(backendTheme);
        setThemeState(backendTheme);
      } catch {
        applyTheme('light');
        setThemeState('light');
      } finally {
        setIsLoading(false);
      }
    };

    initTheme();
  }, [user, hasHydrated]);

  /**
   * 🔹 ВСТАНОВИТИ ТЕМУ
   */
  const setTheme = useCallback(
    async (value: Theme) => {
      applyTheme(value);
      setThemeState(value);

      // ❌ НЕ АВТОРИЗОВАНИЙ → НЕ ЙДЕМО НА БЕКЕНД
      if (!user) return;

      try {
        await saveThemeToBackend(value);
      } catch {
        // не ламаємо UI
      }
    },
    [user]
  );

  /**
   * 🔹 ПЕРЕМИКАЧ
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      isLoading: isLoading || authLoading,
    }),
    [theme, toggleTheme, setTheme, isLoading, authLoading]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
