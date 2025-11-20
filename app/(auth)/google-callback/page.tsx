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

    const confirmGoogleLogin = async () => {
      const loadingId = toast.loading('Входимо через Google...');

      try {
        const user = await authConfirmGoogle(code);

        if (!user) {
          throw new Error('Користувача не знайдено');
        }

        try {
          const profileData = await getMeProfile();
          if (profileData && profileData.user) {
            setUser(profileData.user);
          } else {
            setUser(user);
          }
        } catch {
          setUser(user);
        }

        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        router.replace('/');
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        toast.dismiss(loadingId);
        toast.error('Не вдалося увійти через Google');
        router.replace('/auth/login');
      }
    };

    confirmGoogleLogin();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Підтвердження входу через Google.....</p>
    </div>
  );
}
