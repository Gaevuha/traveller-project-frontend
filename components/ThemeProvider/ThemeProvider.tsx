'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    // Встановлюємо тему при монтуванні
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

