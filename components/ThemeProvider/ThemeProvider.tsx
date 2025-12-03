// ThemeProvider.tsx
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
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const initializingRef = useRef(false);

  // Отримуємо стан авторизації
  const { user, hasHydrated } = useAuthStore();

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);

      // Зберігаємо локально
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
      }

      // Зберігаємо на бекенді тільки якщо користувач авторизований
      if (user) {
        saveThemeToBackend(value).catch(() => {
          console.warn('Failed to save theme to backend');
        });
      }
    },
    [user]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Ініціалізація теми після завантаження авторизації
  useEffect(() => {
    if (typeof window === 'undefined' || initializingRef.current) return;

    const initializeTheme = async () => {
      // Чекаємо поки authStore завантажиться
      if (!hasHydrated) {
        return;
      }

      initializingRef.current = true;
      setIsThemeLoading(true);

      try {
        let finalTheme: Theme = initialTheme;
        let themeSource = 'default';

        // Якщо користувач авторизований - пробуємо отримати тему з бекенду
        if (user) {
          try {
            const backendTheme = await getThemeFromBackend();
            if (backendTheme) {
              finalTheme = backendTheme;
              themeSource = 'backend';
            }
          } catch (error) {
            console.warn('Failed to load theme from backend:', error);
          }
        }

        // Якщо не вдалося отримати з бекенду, перевіряємо localStorage
        if (themeSource === 'default') {
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme === 'light' || storedTheme === 'dark') {
            finalTheme = storedTheme;
            themeSource = 'localStorage';
          }
        }

        // Якщо все ще немає теми, перевіряємо системні налаштування
        if (themeSource === 'default') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          finalTheme = prefersDark ? 'dark' : initialTheme;
          themeSource = 'system';
        }

        // Встановлюємо тему
        setThemeState(finalTheme);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', finalTheme);
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    initializeTheme();

    return () => {
      initializingRef.current = false;
    };
  }, [hasHydrated, user, initialTheme]);

  // Слухаємо зміни авторизації (вхід/вихід)
  useEffect(() => {
    if (!hasHydrated || isThemeLoading) return;

    const handleAuthChange = async () => {
      if (user) {
        // Користувач увійшов - завантажуємо тему з бекенду
        try {
          const backendTheme = await getThemeFromBackend();
          if (backendTheme && backendTheme !== theme) {
            setThemeState(backendTheme);
            localStorage.setItem('theme', backendTheme);
            document.documentElement.setAttribute('data-theme', backendTheme);
          }
        } catch (error) {
          console.warn('Failed to sync theme after login:', error);
        }
      } else {
        // Користувач вийшов - використовуємо тему з localStorage
        const storedTheme = localStorage.getItem('theme') as Theme;
        const validTheme =
          storedTheme === 'light' || storedTheme === 'dark'
            ? storedTheme
            : initialTheme;

        if (validTheme !== theme) {
          setThemeState(validTheme);
          document.documentElement.setAttribute('data-theme', validTheme);
        }
      }
    };

    handleAuthChange();
  }, [user, hasHydrated, isThemeLoading, theme, initialTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      isLoading: isThemeLoading || !hasHydrated,
    }),
    [theme, toggleTheme, setTheme, isThemeLoading, hasHydrated]
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
