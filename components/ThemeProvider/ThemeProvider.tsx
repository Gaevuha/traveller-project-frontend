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

function persistTheme(value: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', value);
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('theme', value);
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `theme=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export default function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(prefersDark ? 'dark' : initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

