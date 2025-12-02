// app/(auth)/auth/google-callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Видаляємо useSearchParams
import { getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const loadingId = toast.loading('Завершення входу через Google...');

      try {
        // Не потрібен код - куки вже встановлені бекендом
        const user = await getMe();

        if (!user) {
          console.log('❌ User not found after Google auth');
          throw new Error('Не вдалося отримати дані користувача');
        }

        console.log('✅ Google auth successful, user:', user.name);
        setUser(user);
        toast.dismiss(loadingId);
        toast.success(`Вітаємо, ${user.name || 'мандрівнику'}!`);

        router.replace('/');
      } catch (err) {
        console.error('❌ Google callback error:', err);
        toast.dismiss(loadingId);
        toast.error('Не вдалося завершити вхід через Google');
        router.replace('/auth/login');
      }
    };

    handleGoogleCallback();
  }, [router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Завершення входу...</h1>
        <p>Будь ласка, зачекайте</p>
      </div>
    </div>
  );
}
