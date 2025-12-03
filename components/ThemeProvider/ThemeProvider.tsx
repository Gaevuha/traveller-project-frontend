// ThemeProvider.tsx - очищена версія
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

type Theme = 'light' | 'dark';

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
  const [isThemeLoading, setIsThemeLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { user, hasHydrated, isLoading: authLoading } = useAuthStore();

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);

      // Зберігаємо локально
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);

      // Зберігаємо на бекенді
      if (user) {
        saveThemeToBackend(value).catch(() => {});
      }
    },
    [user]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // ОСНОВНОЙ useEffect - чекаємо поки auth завантажиться
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!hasHydrated || isInitialized) {
      return;
    }

    setIsThemeLoading(true);

    const loadTheme = async () => {
      try {
        let targetTheme: Theme = initialTheme;

        // 1. Якщо користувач НЕ авторизований - завжди світла тема
        if (!user) {
          targetTheme = 'light';
        }
        // 2. Якщо користувач авторизований - запитуємо з бекенду
        else {
          try {
            const backendTheme = await getThemeFromBackend();
            if (backendTheme) {
              targetTheme = backendTheme;
            } else {
              const storedTheme = localStorage.getItem('theme');
              if (storedTheme === 'light' || storedTheme === 'dark') {
                targetTheme = storedTheme;
              }
            }
          } catch {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
              targetTheme = storedTheme;
            }
          }
        }

        // 3. Встановлюємо тему
        document.documentElement.setAttribute('data-theme', targetTheme);
        setThemeState(targetTheme);
        localStorage.setItem('theme', targetTheme);
        setIsInitialized(true);
      } catch {
        // Ігноруємо помилки
      } finally {
        setIsThemeLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadTheme();
    }, 100);

    return () => clearTimeout(timer);
  }, [hasHydrated, user, initialTheme, isInitialized]);

  // ДОДАТКОВИЙ useEffect для синхронізації при зміні користувача
  useEffect(() => {
    if (!isInitialized) return;

    const handleUserChange = async () => {
      if (user) {
        // Користувач увійшов - завантажуємо його тему з бекенду
        try {
          const backendTheme = await getThemeFromBackend();
          if (backendTheme) {
            setTheme(backendTheme);
          }
        } catch {
          // Ігноруємо помилки
        }
      } else {
        // Користувач вийшов - встановлюємо світлу тему за замовчуванням
        setTheme('light');
      }
    };

    handleUserChange();
  }, [user, isInitialized, setTheme]);

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
