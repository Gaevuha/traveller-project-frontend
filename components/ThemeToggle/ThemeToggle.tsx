'use client';

import type { ButtonHTMLAttributes } from 'react';
import css from './ThemeToggle.module.css';
import { useTheme } from '../ThemeProvider/ThemeProvider';

type ThemeToggleProps = {
  variant?: 'header-main-page' | 'header';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export default function ThemeToggle({
  variant,
  className = '',
  ...buttonProps
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      {...buttonProps}
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`Перемкнути на ${isDark ? 'світлу' : 'темну'} тему`}
      className={`${css.toggle} ${isDark ? css.dark : css.light} ${variant === 'header-main-page' ? css.toggleMain : ''} ${className}`}
    >
      <span className={css.iconWrapper}>
        <SunIcon className={`${css.icon} ${!isDark ? css.iconActive : ''}`} />
      </span>
      <span className={`${css.thumb} ${isDark ? css.thumbDark : ''}`} aria-hidden="true" />
      <span className={css.iconWrapper}>
        <MoonIcon className={`${css.icon} ${isDark ? css.iconActive : ''}`} />
      </span>
    </button>
  );
}

type IconProps = {
  className?: string;
};

function SunIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.93" y1="4.93" x2="6.76" y2="6.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="17.24" y1="17.24" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.93" y1="19.07" x2="6.76" y2="17.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="17.24" y1="6.76" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M21 13a9 9 0 1 1-9-9 7 7 0 0 0 9 9z"
        fill="currentColor"
      />
    </svg>
  );
}

