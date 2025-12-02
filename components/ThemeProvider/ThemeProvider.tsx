'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useRef,
} from 'react';
import { saveThemeToBackend } from '@/lib/api/clientApi';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

// Функція для локального збереження теми
function persistThemeLocally(value: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', value);
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('theme', value);
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `theme=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;

    // Зберігаємо тему на бекенді (без await для уникнення проблем)
    saveThemeToBackend(value).catch(() => {
      // Тиха обробка помилки
    });
  }
}

export default function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializingRef = useRef(false);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Ініціалізація теми при завантаженні
  useEffect(() => {
    if (typeof window === 'undefined' || initializingRef.current) return;

    initializingRef.current = true;

    const initializeTheme = () => {
      try {
        // Спершу перевіряємо локальне сховище
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
          setIsInitialized(true);
          return;
        }

        // Перевірка системних налаштувань
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        setThemeState(prefersDark ? 'dark' : initialTheme);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing theme:', error);
        setIsInitialized(true);
      }
    };

    initializeTheme();

    return () => {
      initializingRef.current = false;
    };
  }, [initialTheme]);

  // Ефект для збереження теми при зміні
  useEffect(() => {
    if (!isInitialized) return;

    persistThemeLocally(theme);
  }, [theme, isInitialized]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
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
