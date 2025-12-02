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
    // Детальне логування всіх параметрів
    console.log('🔍 === GOOGLE CALLBACK DEBUG ===');
    console.log('📍 Поточний URL:', window.location.href);
    console.log('📍 Хост:', window.location.host);
    console.log('📍 Шлях:', window.location.pathname);
    console.log('📍 Пошуковий рядок:', window.location.search);

    // Перетворюємо searchParams в об'єкт для кращого відображення
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    console.log('📍 Всі параметри з useSearchParams():', paramsObj);

    // Також парсимо URL вручну
    const urlParams = new URLSearchParams(window.location.search);
    const urlParamsObj: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      urlParamsObj[key] = value;
    });
    console.log('📍 Параметри з URLSearchParams:', urlParamsObj);

    // Перевіряємо конкретні параметри
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const token = searchParams.get('token');

    console.log('📌 Параметр code:', code);
    console.log('📌 Параметр error:', error);
    console.log('📌 Параметр state:', state);
    console.log('📌 Параметр token:', token);

    if (error) {
      console.log('❌ Отримали помилку:', decodeURIComponent(error));
      toast.error(`Помилка: ${decodeURIComponent(error)}`);
      router.replace('/auth/login');
      return;
    }

    if (!code) {
      console.log('⚠️ Код не знайдено. Усі доступні параметри:');
      console.table(paramsObj);

      // Спробуємо отримати код з інших можливих параметрів
      const possibleCodeParams = [
        'authorization_code',
        'auth_code',
        'oauth_code',
        'access_token',
      ];
      let foundCode = null;

      for (const param of possibleCodeParams) {
        const value = searchParams.get(param);
        if (value) {
          console.log(
            `🔍 Знайшли код у параметрі ${param}:`,
            value.substring(0, 20) + '...'
          );
          foundCode = value;
          break;
        }
      }

      if (!foundCode) {
        toast.error(
          'Не знайдено коду авторизації. Перевірте консоль для деталей.'
        );
        router.replace('/auth/login');
        return;
      }

      // Якщо знайшли код в іншому параметрі
      console.log('🔄 Використовуємо знайдений код');
      processCode(foundCode);
    } else {
      console.log('✅ Знайшли код, починаємо обробку...');
      processCode(code);
    }

    async function processCode(codeParam: string) {
      const loadingId = toast.loading('Входимо через Google...');

      try {
        console.log('🔄 Викликаємо authConfirmGoogle з кодом:');
        console.log(
          'Код (перші 30 символів):',
          codeParam.substring(0, 30) + '...'
        );
        console.log('Довжина коду:', codeParam.length);

        // Використовуємо authConfirmGoogle, який робить POST запит
        const user = await authConfirmGoogle(codeParam);
        console.log('✅ Отримали користувача:', user);

        if (!user) {
          throw new Error('Користувача не знайдено');
        }

        setUser(user);
        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        console.log('✅ Авторизація успішна, перенаправляємо на головну...');
        router.replace('/');
      } catch (err: unknown) {
        console.error('❌ Помилка Google OAuth:', err);

        // Детальне логування помилки
        if (err instanceof AxiosError) {
          const axiosError = err;
          console.error('🔍 Деталі помилки Axios:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            message: axiosError.message,
            code: axiosError.code,
          });

          if (axiosError.response?.status === 400) {
            const errorMessage =
              axiosError.response.data?.error ||
              axiosError.response.data?.message ||
              'Невірний код авторизації';
            toast.error(errorMessage);
          } else if (axiosError.response?.status === 401) {
            toast.error('Помилка авторизації Google');
          } else if (axiosError.response?.status === 404) {
            toast.error('Ендпоінт не знайдено');
          } else {
            toast.error(axiosError.message || 'Не вдалося увійти через Google');
          }
        } else if (err instanceof Error) {
          console.error('🔍 Помилка Error:', err.message, err.stack);
          toast.error(err.message);
        } else {
          console.error('🔍 Невідома помилка:', err);
          toast.error('Не вдалося увійти через Google');
        }

        router.replace('/auth/login');
      }
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Обробка входу через Google...
        </h1>
        <p className="mb-4">Перевірте консоль розробника для деталей</p>
        <div className="text-sm text-gray-500">
          <p>
            URL: {typeof window !== 'undefined' ? window.location.href : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
