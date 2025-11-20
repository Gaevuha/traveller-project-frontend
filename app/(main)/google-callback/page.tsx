'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authConfirmGoogle, getMeProfile } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      toast.error('Не знайдено коду авторизації');
      router.replace('/auth/login');
      return;
    }

    const confirm = async () => {
      const loadingId = toast.loading('Входимо через Google...');

      try {
        const user = await authConfirmGoogle(code);

        if (!user) throw new Error('Користувача не знайдено');

        // Получаем полные данные пользователя
        try {
          const profile = await getMeProfile();
          if (profile?.user) {
            setUser(profile.user);
          } else {
            setUser(user);
          }
        } catch {
          setUser(user);
        }

        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        router.replace('/');
      } catch (err) {
        console.error('❌ Google OAuth error:', err);
        toast.dismiss(loadingId);
        toast.error('Не вдалося увійти через Google');
        router.replace('/auth/login');
      }
    };

    confirm();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Підтвердження входу через Google...</p>
    </div>
  );
}
