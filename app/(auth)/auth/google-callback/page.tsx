// app/(auth)/auth/google-callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authConfirmGoogle } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import styles from './GoogleCallbackPage.module.css';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Помилка авторизації`);
      router.replace('/auth/login');
      return;
    }

    if (!code) {
      toast.error('Не знайдено коду авторизації');
      router.replace('/auth/login');
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

        router.replace('/');
      } catch (err: unknown) {
        toast.dismiss(loadingId);

        if (err instanceof AxiosError) {
          const axiosError = err;

          if (axiosError.response?.status === 400) {
            toast.error('Невірний код авторизації');
          } else if (axiosError.response?.status === 401) {
            toast.error('Помилка авторизації Google');
          } else if (axiosError.response?.status === 404) {
            toast.error('Сервер не знайдено');
          } else {
            toast.error('Не вдалося увійти через Google');
          }
        } else if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('Не вдалося увійти через Google');
        }

        router.replace('/auth/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className={`${styles.container} container`}>
      <div className={styles.content}>
        <div className={styles.loader}></div>
        <h1 className={styles.title}>Обробка входу через Google...</h1>
        <p className={styles.description}>Будь ласка, зачекайте</p>
      </div>
    </div>
  );
}
