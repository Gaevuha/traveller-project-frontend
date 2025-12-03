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
  const initializingRef = useRef(false);
  const { user, hasHydrated } = useAuthStore();

  // Синхронізована функція встановлення теми
  const setTheme = useCallback(
    (newTheme: Theme) => {
      console.log('🎨 setTheme called:', { current: theme, new: newTheme });

      setThemeState(newTheme);

      // Застосовуємо тему в DOM
      document.documentElement.setAttribute('data-theme', newTheme);

      // Зберігаємо в localStorage
      localStorage.setItem('theme', newTheme);

      // Зберігаємо на бекенді (якщо авторизований)
      if (user) {
        console.log('🎨 Saving theme to backend for user:', user._id);
        saveThemeToBackend(newTheme).catch(() => {
          console.warn('Failed to save theme to backend');
        });
      } else {
        console.log('🎨 User not authenticated, theme saved only locally');
      }
    },
    [user, theme]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Ініціалізація теми при першому завантаженні
  useEffect(() => {
    if (
      !hasHydrated ||
      typeof window === 'undefined' ||
      initializingRef.current
    )
      return;

    const initializeTheme = async () => {
      initializingRef.current = true;
      console.log('=== 🎨 THEME INITIALIZATION START ===');
      console.log('Current state:', {
        user: user?._id,
        hasHydrated,
        localStorageTheme: localStorage.getItem('theme'),
        htmlTheme: document.documentElement.getAttribute('data-theme'),
      });

      let finalTheme: Theme = initialTheme;
      let themeApplied = false;
      let source = 'default';

      // 1. Перевіряємо авторизацію та бекенд
      if (user) {
        try {
          console.log('🎨 Fetching theme from backend for user:', user._id);
          const backendTheme = await getThemeFromBackend();
          console.log('🎨 Backend theme response:', backendTheme);

          if (backendTheme) {
            finalTheme = backendTheme;
            themeApplied = true;
            source = 'backend';
            console.log(`🎨 Using theme from ${source}: ${finalTheme}`);
          } else {
            console.log('🎨 No theme from backend, falling back');
          }
        } catch (error) {
          console.warn('🎨 Failed to load theme from backend:', error);
        }
      }

      // 2. localStorage
      if (!themeApplied) {
        const storedTheme = localStorage.getItem('theme');
        console.log('🎨 LocalStorage theme:', storedTheme);

        if (storedTheme === 'light' || storedTheme === 'dark') {
          finalTheme = storedTheme;
          themeApplied = true;
          source = 'localStorage';
          console.log(`🎨 Using theme from ${source}: ${finalTheme}`);
        }
      }

      // 3. Системна тема
      if (!themeApplied) {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        finalTheme = prefersDark ? 'dark' : initialTheme;
        source = 'system';
        console.log(`🎨 Using theme from ${source}: ${finalTheme}`);
      }

      // Встановлюємо тему тільки якщо вона відрізняється від поточної
      if (finalTheme !== theme) {
        console.log(`🎨 Setting theme to: ${finalTheme} (source: ${source})`);
        setThemeState(finalTheme);
        document.documentElement.setAttribute('data-theme', finalTheme);

        // Зберігаємо в localStorage тільки якщо це не default
        if (source !== 'default') {
          localStorage.setItem('theme', finalTheme);
          console.log('🎨 Saved to localStorage:', finalTheme);
        }
      } else {
        console.log(`🎨 Theme already set to ${finalTheme}, skipping`);
      }

      console.log('=== 🎨 THEME INITIALIZATION END ===');
      initializingRef.current = false;
    };

    initializeTheme();
  }, [hasHydrated, user, initialTheme, theme]);

  // Примусова синхронізація після входу користувача
  useEffect(() => {
    if (!hasHydrated || !user || initializingRef.current) return;

    const forceSyncTheme = async () => {
      console.log('🎨 Force syncing theme for logged in user:', user._id);

      try {
        const backendTheme = await getThemeFromBackend();
        console.log('🎨 Force sync - backend theme:', backendTheme);

        if (backendTheme && backendTheme !== theme) {
          console.log(
            `🎨 Force sync: changing theme from ${theme} to ${backendTheme}`
          );

          // Використовуємо setTheme для повної синхронізації
          setTheme(backendTheme);
        } else if (!backendTheme) {
          console.log(
            '🎨 Force sync: no backend theme, keeping current:',
            theme
          );
        } else {
          console.log('🎨 Force sync: theme already synchronized');
        }
      } catch (error) {
        console.warn('🎨 Force sync failed:', error);
      }
    };

    // Затримка для уникнення гонок з ініціалізацією
    const timeoutId = setTimeout(forceSyncTheme, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, hasHydrated, theme, setTheme]);

  // Логування змін стану для дебагу
  useEffect(() => {
    console.log('🎨 ThemeProvider state changed:', {
      theme,
      user: user?._id,
      hasHydrated,
      localStorageTheme:
        typeof window !== 'undefined' ? localStorage.getItem('theme') : 'n/a',
      htmlTheme:
        typeof document !== 'undefined'
          ? document.documentElement.getAttribute('data-theme')
          : 'n/a',
    });
  }, [theme, user, hasHydrated]);

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
