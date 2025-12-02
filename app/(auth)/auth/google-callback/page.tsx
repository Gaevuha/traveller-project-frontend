'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authConfirmGoogle } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore(state => state.setUser);
  const hasProcessed = useRef(false); // Додаємо ref

  useEffect(() => {
    // Запобігаємо подвійному виклику
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Помилка авторизації Google: ${error}`);
      setTimeout(() => router.replace('/auth/login'), 1500);
      return;
    }

    if (!code) {
      toast.error('Не знайдено коду авторизації Google');
      setTimeout(() => router.replace('/auth/login'), 1500);
      return;
    }

    const handleGoogleCallback = async () => {
      const loadingId = toast.loading('Входимо через Google...');

      try {
        const user = await authConfirmGoogle(code);

        if (!user) {
          throw new Error('Користувача не знайдено');
        }

        setUser(user);
        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        setTimeout(() => router.replace('/'), 1000);
      } catch (err: unknown) {
        toast.dismiss(loadingId);

        if (err instanceof AxiosError) {
          const axiosError = err;

          if (axiosError.response?.status === 400) {
            toast.error('Невірний код авторизації Google');
          } else if (axiosError.response?.status === 401) {
            toast.error('Помилка авторизації Google');
          } else if (axiosError.response?.status === 404) {
            toast.error('Сервер не знайдено');
          } else if (axiosError.response?.status === 500) {
            toast.error('Помилка сервера, спробуйте пізніше');
          } else {
            toast.error('Не вдалося увійти через Google');
          }
        } else if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('Не вдалося увійти через Google');
        }

        setTimeout(() => router.replace('/auth/login'), 1500);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser]);

  return null;
}
