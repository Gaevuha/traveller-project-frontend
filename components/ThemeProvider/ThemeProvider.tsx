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
import { saveTheme, getTheme } from '@/lib/api/clientApi';
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

  /**
   * Локальне застосування теми (тільки UI)
   */
  const applyTheme = useCallback((value: Theme) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
    setThemeState(value);
  }, []);

  /**
   * Публічний setter
   */
  const setTheme = useCallback(
    async (value: Theme) => {
      applyTheme(value);

      // Zustand (UI sync)
      if (user && updateUserTheme) {
        updateUserTheme(value);
      }

      // backend ТІЛЬКИ якщо залогінений
      if (user) {
        try {
          await saveTheme(value);
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

  /**
   * ІНІЦІАЛІЗАЦІЯ
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const init = async () => {
      setIsThemeLoading(true);

      // 1️⃣ дефолт
      let resolvedTheme: Theme = 'light';

      // 2️⃣ локальна тема (для гостей)
      const localTheme = localStorage.getItem('theme') as Theme | null;
      if (localTheme) {
        resolvedTheme = localTheme;
      }

      // 3️⃣ авторизований → бекенд головний
      if (user) {
        try {
          const backendTheme = await getTheme();
          if (backendTheme) {
            resolvedTheme = backendTheme;
          }
        } catch (e) {
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
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
