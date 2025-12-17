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
import { saveThemeToBackend, getThemeFromBackend } from '@/lib/api/clientApi';
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

// Функція для оновлення cookie
const updateThemeCookie = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  document.cookie = `theme=${theme}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
};

export default function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  const {
    user,
    hasHydrated,
    isLoading: authLoading,
    updateUserTheme,
  } = useAuthStore();

  const saveThemeLocally = useCallback((value: Theme) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
    updateThemeCookie(value);
  }, []);

  const setTheme = useCallback(
    async (value: Theme) => {
      try {
        // 1. Зберігаємо локально (тільки на клієнті)
        if (typeof window !== 'undefined') {
          saveThemeLocally(value);
          setThemeState(value);

          // 2. Оновлюємо в Zustand
          if (user && updateUserTheme) {
            updateUserTheme(value);
          }

          // 3. Відправляємо на сервер
          await saveThemeToBackend(value);
        } else {
          // На сервері тільки оновлюємо стан
          setThemeState(value);
        }
      } catch (error) {
        console.error('Помилка зміни теми:', error);
      }
    },
    [user, updateUserTheme, saveThemeLocally]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Ініціалізація теми при завантаженні - тільки на клієнті
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasHydrated) return;

    setIsThemeLoading(true);

    const initializeTheme = async () => {
      try {
        let targetTheme: Theme = initialTheme;

        // Пріоритет 1: cookie
        const cookieTheme = document.cookie
          .split('; ')
          .find(row => row.startsWith('theme='))
          ?.split('=')[1] as Theme | null;

        if (
          cookieTheme &&
          (cookieTheme === 'light' || cookieTheme === 'dark')
        ) {
          targetTheme = cookieTheme;
        }

        // Пріоритет 2: localStorage
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && (!cookieTheme || storedTheme !== cookieTheme)) {
          targetTheme = storedTheme;
        }

        // Пріоритет 3: БД (тільки для авторизованих)
        if (user && !cookieTheme && !storedTheme) {
          try {
            const backendTheme = await getThemeFromBackend();
            if (backendTheme && backendTheme !== 'light') {
              targetTheme = backendTheme;
            }
          } catch (error: unknown) {
            // Мовчазно ігноруємо помилки отримання теми
          }
        }

        // Застосовуємо тему
        saveThemeLocally(targetTheme);
        setThemeState(targetTheme);
      } catch (error) {
        console.error('Помилка ініціалізації теми:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    initializeTheme();
  }, [hasHydrated, user, initialTheme, saveThemeLocally]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      isLoading: isThemeLoading || !hasHydrated || authLoading,
    }),
    [theme, toggleTheme, setTheme, isThemeLoading, hasHydrated, authLoading]
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
