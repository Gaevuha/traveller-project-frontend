// hooks/useThemeSync.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getTheme } from '@/lib/api/clientApi';
import type { Theme } from '@/components/ThemeProvider/ThemeProvider';

export function useThemeSync() {
  const { user, updateUserTheme, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    // Синхронізація при зміні стану авторизації
    const syncTheme = async () => {
      if (user) {
        try {
          // Отримуємо тему з бекенду
          const backendTheme = await getTheme();

          if (backendTheme && backendTheme !== user.theme) {
            console.log('🔄 Синхронізація теми з бекенду:', backendTheme);

            // Оновлюємо в Zustand
            if (updateUserTheme) {
              updateUserTheme(backendTheme);
            }

            // Оновлюємо localStorage
            localStorage.setItem('theme', backendTheme);
          }
        } catch (error) {
          console.log('ℹ️ Не вдалося синхронізувати тему з бекенду');
        }
      } else {
        // Для гостей: перевіряємо localStorage
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
          console.log('👤 Гостьова тема з localStorage:', storedTheme);
        }
      }
    };

    syncTheme();
  }, [user, hasHydrated, updateUserTheme]);

  // Функція для примусової синхронізації
  const forceSync = async () => {
    if (user) {
      try {
        const backendTheme = await getTheme();
        if (backendTheme && updateUserTheme) {
          updateUserTheme(backendTheme);
          localStorage.setItem('theme', backendTheme);
          return backendTheme;
        }
      } catch (error) {
        console.error('Помилка примусової синхронізації:', error);
      }
    }
    return null;
  };

  return { forceSync };
}
