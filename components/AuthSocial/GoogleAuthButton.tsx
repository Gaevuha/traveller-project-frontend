'use client';

import { FaGoogle } from 'react-icons/fa';
import { getGoogleAuthUrl } from '@/lib/api/clientApi';
import { toast } from 'react-hot-toast';
import css from './GoogleAuthButton.module.css';

export default function GoogleAuthButton() {
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
          Увійти через Google
          <FaGoogle size={18} />
        </span>
      </button>
    </div>
  );
}
