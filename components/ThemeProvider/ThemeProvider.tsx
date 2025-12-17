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

  // useEffect для ініціалізації
  useEffect(() => {
    if (!hasHydrated) return;

    const initializeTheme = async () => {
      // 1. Дефолтна тема для всіх
      let targetTheme: Theme = 'light';

      // 2. Якщо cookie або localStorage є — беремо їх
      const cookieTheme = document.cookie
        .split('; ')
        .find(row => row.startsWith('theme='))
        ?.split('=')[1] as Theme | null;
      const storedTheme = localStorage.getItem('theme') as Theme | null;

      if (cookieTheme) targetTheme = cookieTheme;
      else if (storedTheme) targetTheme = storedTheme;

      // 3. Якщо користувач авторизований — підтягуємо тему з БД і перезаписуємо
      if (user) {
        try {
          const backendTheme = await getThemeFromBackend();
          if (backendTheme) targetTheme = backendTheme;
        } catch (error) {
          console.error('Помилка отримання теми з бекенду:', error);
        }
      }

      saveThemeLocally(targetTheme);
      setThemeState(targetTheme);
      setIsThemeLoading(false);
    };

    initializeTheme();
  }, [hasHydrated, user, saveThemeLocally]);

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
