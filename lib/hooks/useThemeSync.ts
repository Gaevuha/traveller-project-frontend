// hooks/useThemeSync.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

export function useThemeSync() {
  const { user } = useAuthStore();
  const { syncWithBackend } = useTheme();

  useEffect(() => {
    if (!user) return;

    // Синхронізувати при завантаженні
    syncWithBackend();

    // Синхронізувати кожні 30 секунд
    const interval = setInterval(syncWithBackend, 30000);

    return () => clearInterval(interval);
  }, [user, syncWithBackend]);
}

// Використовуйте в layout.tsx:
/*
export default function RootLayout({ children }: { children: React.ReactNode }) {
  useThemeSync();
  return <>{children}</>;
}
*/
