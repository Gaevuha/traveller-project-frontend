'use client';

import { useThemeStore } from '@/lib/store/themeStore';
import css from './ThemeToggle.module.css';

type ThemeToggleProps = {
  variant?: 'header' | 'header-main-page' | 'mobile-menu';
};

export default function ThemeToggle({ variant }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  const getVariantClass = () => {
    if (!variant) return '';
    if (variant === 'header-main-page') return css.toggleHeaderMainPage;
    if (variant === 'mobile-menu') return css.toggleMobileMenu;
    return css.toggleHeader;
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${css.toggle} ${getVariantClass()}`}
      aria-label={
        theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'
      }
      type="button"
    >
      {theme === 'light' ? (
        <svg
          className={css.icon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className={css.icon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
