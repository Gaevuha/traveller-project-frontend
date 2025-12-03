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

// Допоміжна функція для отримання теми з cookies
const getCookieTheme = (): Theme | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'theme' && (value === 'light' || value === 'dark')) {
      return value;
    }
  }
  return null;
};

// Допоміжна функція для збереження теми в cookies
const setCookieTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;

  const maxAge = 30 * 24 * 60 * 60; // 30 днів
  document.cookie = `theme=${theme}; max-age=${maxAge}; path=/; samesite=lax${
    process.env.NODE_ENV === 'production' ? '; secure' : ''
  }`;
};

export default function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const initializingRef = useRef(false);
  const { user, hasHydrated } = useAuthStore();

  // Для відстеження змін користувача
  const previousUserRef = useRef(user);

  // Синхронізована функція встановлення теми
  const setTheme = useCallback(
    (newTheme: Theme) => {
      console.log(`🎨 [${Date.now()}] setTheme called:`, {
        current: theme,
        new: newTheme,
        user: user?._id,
      });

      // Оновлюємо локальний стан
      setThemeState(newTheme);

      // Застосовуємо тему в DOM
      document.documentElement.setAttribute('data-theme', newTheme);

      // Зберігаємо в localStorage (для швидкого доступу)
      localStorage.setItem('theme', newTheme);

      // Зберігаємо в cookies (для синхронізації між пристроями)
      setCookieTheme(newTheme);

      // Зберігаємо на бекенді (основне джерело істини)
      if (user) {
        console.log(
          `🎨 [${Date.now()}] Saving theme to backend for user:`,
          user._id
        );
        saveThemeToBackend(newTheme).catch(error => {
          console.warn('Failed to save theme to backend:', error);
        });
      } else {
        console.log('🎨 User not authenticated, theme saved to cookies only');
      }
    },
    [user, theme]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Головна ініціалізація теми
  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') {
      console.log(`🎨 [${Date.now()}] Skipping init - waiting for hydration`);
      return;
    }

    if (initializingRef.current) {
      console.log(`🎨 [${Date.now()}] Skipping init - already initializing`);
      return;
    }

    const initializeTheme = async () => {
      initializingRef.current = true;

      console.log(`=== 🎨 [${Date.now()}] THEME INITIALIZATION START ===`);
      console.log(`🎨 Current state:`, {
        user: user?._id,
        userExists: !!user,
        hasHydrated,
        localStorageTheme: localStorage.getItem('theme'),
        cookieTheme: getCookieTheme(),
        htmlTheme: document.documentElement.getAttribute('data-theme'),
        currentStateTheme: theme,
      });

      let finalTheme: Theme = initialTheme;
      let source = 'default';

      const storedLocalTheme = localStorage.getItem('theme') as Theme;
      const cookieTheme = getCookieTheme();

      // СТРАТЕГІЯ ПРІОРИТЕТІВ:

      // 1. Авторизований користувач - ОБОВ'ЯЗКОВО з бекенду
      if (user) {
        try {
          console.log(`🎨 Fetching theme from backend for user:`, user._id);
          const backendTheme = await getThemeFromBackend();
          console.log(`🎨 Backend theme response:`, backendTheme);

          if (backendTheme) {
            finalTheme = backendTheme;
            source = 'backend';
            console.log(`🎨 Using backend theme: ${finalTheme}`);

            // СИНХРОНІЗАЦІЯ: Приводимо всі джерела до одного стану
            if (storedLocalTheme !== backendTheme) {
              localStorage.setItem('theme', backendTheme);
              console.log(`🎨 Synced localStorage with backend`);
            }
            if (cookieTheme !== backendTheme) {
              setCookieTheme(backendTheme);
              console.log(`🎨 Synced cookies with backend`);
            }
          } else {
            console.log(
              `🎨 No theme from backend, falling back to other sources`
            );
          }
        } catch (error) {
          console.warn(`🎨 Failed to load theme from backend:`, error);
        }
      }

      // 2. Якщо не отримали з бекенду, перевіряємо cookies
      if (source === 'default' && cookieTheme) {
        finalTheme = cookieTheme;
        source = 'cookies';
        console.log(`🎨 Using cookies theme: ${finalTheme}`);

        // Синхронізуємо localStorage з cookies
        if (storedLocalTheme !== cookieTheme) {
          localStorage.setItem('theme', cookieTheme);
        }
      }

      // 3. Якщо немає cookies, перевіряємо localStorage
      else if (
        source === 'default' &&
        (storedLocalTheme === 'light' || storedLocalTheme === 'dark')
      ) {
        finalTheme = storedLocalTheme;
        source = 'localStorage';
        console.log(`🎨 Using localStorage theme: ${finalTheme}`);

        // Синхронізуємо cookies з localStorage
        setCookieTheme(storedLocalTheme);
      }

      // 4. Системна тема
      else if (source === 'default') {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        finalTheme = prefersDark ? 'dark' : initialTheme;
        source = 'system';
        console.log(`🎨 Using system theme: ${finalTheme}`);
      }

      // Застосовуємо тему тільки якщо потрібно
      const currentHtmlTheme =
        document.documentElement.getAttribute('data-theme');
      if (finalTheme !== currentHtmlTheme || finalTheme !== theme) {
        console.log(`🎨 Applying theme ${finalTheme} (source: ${source})`, {
          wasHtml: currentHtmlTheme,
          wasState: theme,
          willBe: finalTheme,
        });

        setThemeState(finalTheme);
        document.documentElement.setAttribute('data-theme', finalTheme);

        // Додатково зберігаємо в джерелах, якщо ще не збережено
        if (source !== 'localStorage') {
          localStorage.setItem('theme', finalTheme);
        }
        if (source !== 'cookies' && source !== 'backend') {
          setCookieTheme(finalTheme);
        }
      } else {
        console.log(`🎨 Theme already correct (${finalTheme}), skipping`);
      }

      console.log(`=== 🎨 [${Date.now()}] THEME INITIALIZATION END ===`);
      initializingRef.current = false;
    };

    initializeTheme();
  }, [hasHydrated, user, initialTheme, theme]);

  // Відстеження змін авторизації (спеціально для нового пристрою)
  useEffect(() => {
    if (!hasHydrated) return;

    console.log('🎨 Auth state tracking:', {
      previousUser: previousUserRef.current?._id,
      currentUser: user?._id,
      change:
        !previousUserRef.current && user
          ? 'LOGIN'
          : previousUserRef.current && !user
            ? 'LOGOUT'
            : 'NO_CHANGE',
    });

    // Користувач увійшов на новому пристрої
    if (!previousUserRef.current && user) {
      console.log(
        `🎨 User logged in on potentially new device, forcing backend sync`
      );

      const forceBackendSync = async () => {
        try {
          // Даємо час для стабілізації
          await new Promise(resolve => setTimeout(resolve, 800));

          const backendTheme = await getThemeFromBackend();
          const currentLocalTheme = localStorage.getItem('theme') as Theme;
          const currentCookieTheme = getCookieTheme();

          console.log('🎨 New device sync check:', {
            backendTheme,
            currentLocalTheme,
            currentCookieTheme,
            user: user._id,
          });

          if (backendTheme) {
            // Якщо локальні джерела відрізняються від бекенду
            if (
              backendTheme !== currentLocalTheme ||
              backendTheme !== currentCookieTheme
            ) {
              console.log(
                `🎨 New device: overriding local state with backend theme ${backendTheme}`
              );
              setTheme(backendTheme);
            } else {
              console.log(`🎨 New device: already in sync with backend`);
            }
          }
        } catch (error) {
          console.warn('🎨 New device sync failed:', error);
        }
      };

      forceBackendSync();
    }

    // Користувач вийшов - зберігаємо тему в cookies для неавторизованого стану
    if (previousUserRef.current && !user) {
      console.log(`🎨 User logged out, preserving theme in cookies`);
      // Тема вже збережена в cookies, нічого робити не потрібно
    }

    previousUserRef.current = user;
  }, [user, hasHydrated, setTheme]);

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
