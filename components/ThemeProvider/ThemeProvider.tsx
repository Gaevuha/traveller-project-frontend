// ThemeProvider.tsx - очищена версія
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
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
  syncWithBackend: () => Promise<void>;
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

  const isSyncingRef = useRef(false);
  const isSettingRef = useRef(false);

  const {
    user,
    hasHydrated,
    isLoading: authLoading,
    updateUserTheme,
  } = useAuthStore();

  const syncWithBackend = useCallback(async () => {
    if (!user || isSyncingRef.current) return;

    isSyncingRef.current = true;
    try {
      const backendTheme = await getThemeFromBackend();

      if (backendTheme && backendTheme !== theme && !isSettingRef.current) {
        setThemeState(backendTheme);
        document.documentElement.setAttribute('data-theme', backendTheme);
        localStorage.setItem('theme', backendTheme);

        if (updateUserTheme) {
          updateUserTheme(backendTheme);
        }
      }
    } catch (error) {
      console.error('Помилка синхронізації теми з бекендом:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [user, theme, updateUserTheme]);

  const setTheme = useCallback(
    async (value: Theme) => {
      if (isSettingRef.current) return;

      isSettingRef.current = true;

      try {
        setThemeState(value);
        document.documentElement.setAttribute('data-theme', value);
        localStorage.setItem('theme', value);

        if (user && updateUserTheme) {
          updateUserTheme(value);
        }

        if (user) {
          await saveThemeToBackend(value);
          setTimeout(() => {
            syncWithBackend();
          }, 500);
        }
      } catch (error) {
        console.error('Помилка збереження теми на бекенді:', error);
      } finally {
        setTimeout(() => {
          isSettingRef.current = false;
        }, 1000);
      }
    },
    [user, updateUserTheme, syncWithBackend]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasHydrated) return;
    if (isInitialized) return;

    setIsThemeLoading(true);

    const initializeTheme = async () => {
      try {
        let targetTheme: Theme = initialTheme;

        if (user) {
          try {
            const backendTheme = await getThemeFromBackend();
            if (backendTheme) {
              targetTheme = backendTheme;
            } else {
              const storedTheme = localStorage.getItem('theme') as Theme | null;
              if (
                storedTheme &&
                (storedTheme === 'light' || storedTheme === 'dark')
              ) {
                targetTheme = storedTheme;
              } else if (user.theme) {
                targetTheme = user.theme;
              }
            }
          } catch (error) {
            const storedTheme = localStorage.getItem('theme') as Theme | null;
            if (
              storedTheme &&
              (storedTheme === 'light' || storedTheme === 'dark')
            ) {
              targetTheme = storedTheme;
            } else if (user.theme) {
              targetTheme = user.theme;
            }
          }
        } else {
          targetTheme = 'light';
        }

        document.documentElement.setAttribute('data-theme', targetTheme);
        setThemeState(targetTheme);
        localStorage.setItem('theme', targetTheme);

        if (user && user.theme !== targetTheme && updateUserTheme) {
          updateUserTheme(targetTheme);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Помилка ініціалізації теми:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    initializeTheme();
  }, [hasHydrated, user, initialTheme, isInitialized, updateUserTheme]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleUserChange = async () => {
      if (user) {
        isSettingRef.current = false;
        isSyncingRef.current = false;
        await syncWithBackend();
      } else {
        setTheme('light');
      }
    };

    handleUserChange();
  }, [user, isInitialized, syncWithBackend, setTheme]);

  useEffect(() => {
    if (!isInitialized || !user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithBackend();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInitialized, user, syncWithBackend]);

  useEffect(() => {
    if (!isInitialized || !user) return;

    const interval = setInterval(() => {
      syncWithBackend();
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialized, user, syncWithBackend]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      isLoading: isThemeLoading || !hasHydrated || authLoading,
      syncWithBackend,
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      isThemeLoading,
      hasHydrated,
      authLoading,
      syncWithBackend,
    ]
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
