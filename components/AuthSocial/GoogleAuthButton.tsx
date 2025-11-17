'use client';

import { useEffect, useState } from 'react';
import { getGoogleAuthUrl } from '@/lib/api/clientApi';
import { toast } from 'react-hot-toast';
import css from './GoogleAuthButton.module.css';

export default function GoogleAuthButton() {
  const [FaGoogle, setFaGoogle] = useState<React.ComponentType<{ size?: number }> | null>(null);

  useEffect(() => {
    // Динамічний імпорт для обходу проблем з Turbopack
    import('react-icons/fa')
      .then((module) => {
        setFaGoogle(() => module.FaGoogle);
      })
      .catch((error) => {
        console.warn('Failed to load FaGoogle icon:', error);
      });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const url = await getGoogleAuthUrl();

      if (url) {
        console.log('🌐 Redirecting to Google Auth URL:', url);
        window.location.href = url;
      } else {
        throw new Error('URL авторизації не знайдено');
      }
    } catch (error: unknown) {
      console.error('❌ Google auth init failed:', error);
      toast.error('Не вдалося отримати посилання для входу через Google');
    }
  };

  return (
    <div className={css.container}>
      <p className={css.orText}>або</p>
     <button type="button" className={css.button} onClick={handleGoogleLogin}>
  <span className={css.buttonContent}>
    <FaGoogle className={css.icon} />
    Увійти через Google
  </span>
</button>
    </div>
  );
}
