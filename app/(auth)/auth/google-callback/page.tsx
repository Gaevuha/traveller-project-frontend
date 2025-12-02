// app/(auth)/auth/google-callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authConfirmGoogle } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('🔍 Google callback - Code:', code ? '✅' : '❌');
    console.log('Error:', error);

    if (error) {
      toast.error(`Помилка: ${decodeURIComponent(error)}`);
      router.replace('/auth/login');
      return;
    }

    if (!code) {
      toast.error('Не знайдено коду авторизації');
      router.replace('/auth/login');
      return;
    }

    const handleCallback = async () => {
      const loadingId = toast.loading('Входимо через Google...');

      try {
        console.log('🔄 Викликаємо authConfirmGoogle...');

        // Використовуємо authConfirmGoogle, який робить POST запит
        const user = await authConfirmGoogle(code);
        console.log('✅ Отримали користувача:', user);

        if (!user) {
          throw new Error('Користувача не знайдено');
        }

        setUser(user);
        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        router.replace('/');
      } catch (err: unknown) {
        console.error('❌ Помилка Google OAuth:', err);

        // Більш детальна обробка помилок
        if (err instanceof AxiosError) {
          if (err.response?.status === 400) {
            toast.error('Невірний код авторизації');
          } else if (err.response?.status === 401) {
            toast.error('Помилка авторизації Google');
          } else {
            toast.error(err.message || 'Не вдалося увійти через Google');
          }
        } else if (err instanceof Error) {
          toast.error(err.message || 'Не вдалося увійти через Google');
        } else {
          toast.error('Не вдалося увійти через Google');
        }

        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Обробка входу через Google...
        </h1>
        <p>Будь ласка, зачекайте</p>
      </div>
    </div>
  );
}
