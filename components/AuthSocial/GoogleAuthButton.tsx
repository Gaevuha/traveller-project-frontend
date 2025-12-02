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
      console.log('🔍 === STARTING GOOGLE OAUTH ===');
      console.log('📍 Поточний URL:', window.location.href);

      const url = await getGoogleOAuthUrl();
      console.log('✅ Отримали OAuth URL, редіректимо...');
      console.log('📍 Повний URL для редіректу:', url);

      // Розбираємо URL для перевірки
      const urlObj = new URL(url);
      console.log('🔍 Деталі редірект URL:');
      console.log(
        '  - Куди Google відправить користувача:',
        urlObj.searchParams.get('redirect_uri')
      );
      console.log('  - Повний шлях:', urlObj.toString());

      // Тимчасово збережемо URL для налагодження
      localStorage.setItem('last_oauth_url', url);

      window.location.href = url;
    } catch (error) {
      console.error('❌ Google auth init failed:', error);
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
