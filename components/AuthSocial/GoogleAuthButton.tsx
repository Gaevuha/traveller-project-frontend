'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { getGoogleOAuthUrl } from '@/lib/api/clientApi';
import { toast } from 'react-hot-toast';
import css from './GoogleAuthButton.module.css';

// Тип для іконки: просто будь-який React-компонент, який приймає className
type GoogleIconType = ComponentType<{ className?: string }>;

export default function GoogleAuthButton() {
  const [FaGoogle, setFaGoogle] = useState<GoogleIconType | null>(null);

  useEffect(() => {
    import('react-icons/fa')
      .then(module => {
        // Беремо FaGoogle з модуля і кладемо як компонент
        setFaGoogle(() => module.FaGoogle);
      })
      .catch(error => {
        console.warn('Failed to load FaGoogle icon:', error);
      });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const authUrl = await getGoogleOAuthUrl();
      if (authUrl) {
        console.log('🌐 Redirecting to Google Auth URL:', authUrl);
        window.location.href = authUrl;
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
          {/* Рендеримо іконку тільки якщо вона вже завантажена */}
          {FaGoogle ? (
            <FaGoogle className={css.icon} />
          ) : (
            // fallback, поки іконка вантажиться (можна G, можна skeleton)
            <span className={css.iconPlaceholder}>G</span>
          )}
          Увійти через Google
        </span>
      </button>
    </div>
  );
}
