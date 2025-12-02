'use client';

import { Icon } from '@/components/Icon/Icon';
import css from './ProfileAndLogoutLinks.module.css';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useState, useEffect } from 'react';
import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';
import Image from 'next/image';
import Modal from '@/components/Modal/Modal';
import { getMe } from '@/lib/api/clientApi';

type ProfileAndLogoutLinksProps = {
  variant?: 'header-main-page' | 'mobile-menu';
};

export default function ProfileAndLogoutLinks({
  variant,
}: ProfileAndLogoutLinksProps) {
  const { logout } = useAuth();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Завантажуємо повний профіль при зміні user
  useEffect(() => {
    const loadAvatarIfMissing = async () => {
      if (user && !user.avatarUrl) {
        try {
          // Чекаємо 1 секунду, щоб сесія точно встановилася
          const timeoutId = setTimeout(async () => {
            try {
              const fullUser = await getMe(true);
              if (fullUser?.avatarUrl) {
                // Оновлюємо користувача з аватаркою
                setUser({ ...user, avatarUrl: fullUser.avatarUrl });
              }
            } catch {
              // Ігноруємо помилку
            }
          }, 1000);

          return () => clearTimeout(timeoutId);
        } catch {
          // Ігноруємо помилку
        }
      }
    };

    loadAvatarIfMissing();
  }, [user, setUser]);

  const handleLogoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
    closeMobileMenu();
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setIsModalOpen(false);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  // Отримуємо ім'я та аватарку
  const userName = user?.name || 'Користувач';
  const userAvatar = user?.avatarUrl;

  return (
    <div className={css.container}>
      <Link
        onClick={closeMobileMenu}
        href="/profile"
        className={css.profileLink}
      >
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt={userName}
            className={css.avatar}
            width={32}
            height={32}
          />
        ) : (
          <Icon name="avatar" className={css.avatar} />
        )}
        <p
          className={`${css.name} ${variant === 'header-main-page' ? css.nameMainPage : ''}`}
        >
          {userName}
        </p>
      </Link>
      <div
        className={`${css.divider} ${variant === 'header-main-page' ? css.dividerMainPage : ''}`}
      ></div>

      <button
        onClick={handleLogoutClick}
        className={css.logoutLink}
        type="button"
        disabled={isLoggingOut}
        aria-label="Вийти з облікового запису"
      >
        <Icon
          name="icon-logout"
          className={`${css.logoutIcon} ${variant === 'header-main-page' ? css.logoutIconMainPage : ''}`}
        />
      </button>

      <Modal
        title="Ви точно хочете вийти?"
        message="Ми будемо сумувати за вами!"
        confirmButtonText="Вийти"
        cancelButtonText="Відмінити"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        onClose={handleCancelLogout}
        isOpen={isModalOpen}
      />
    </div>
  );
}
