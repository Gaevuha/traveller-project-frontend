'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { getGoogleOAuthUrl } from '@/lib/api/clientApi';
import { toast } from 'react-hot-toast';
import css from './GoogleAuthButton.module.css';

type GoogleIconType = ComponentType<{ className?: string }>;

export default function GoogleAuthButton() {
  const [FaGoogle, setFaGoogle] = useState<GoogleIconType | null>(null);

  useEffect(() => {
    import('react-icons/fa').then(module => {
      setFaGoogle(() => module.FaGoogle);
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const url = await getGoogleOAuthUrl();
      window.location.href = url;
    } catch {
      toast.error('Не вдалося ініціювати вхід через Google');
    }
  };

  return (
    <div className={css.container}>
      <p className={css.orText}>або</p>
      <button type="button" className={css.button} onClick={handleGoogleLogin}>
        <span className={css.buttonContent}>
          {FaGoogle ? (
            <FaGoogle className={css.icon} />
          ) : (
            <span className={css.iconPlaceholder}>G</span>
          )}
          Увійти через Google
        </span>
      </button>
    </div>
  );
}
