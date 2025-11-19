// components/Logo/Logo.tsx

'use client';

import Link from 'next/link';
import css from './Logo.module.css';
import Image from 'next/image';

type LogoProps = {
  variant?: 'header-main-page' | 'mobile-menu-open' | 'footer' | undefined;
  handleClick?: (value: boolean) => void;
};

export default function Logo({ variant, handleClick }: LogoProps) {
  return (
    <Link
      onClick={() => handleClick?.(false)}
      className={`
    ${css.logoLink}                       /* завжди базовий клас */
    ${variant === 'footer' ? css.logoLinkFooter : ''} 
    ${variant === 'header-main-page' ? css.logoLinkHeaderMain : ''} 
    ${variant === 'mobile-menu-open' ? css.logoLinkMobileMenuOpen : ''}
  `}
      href="/"
    >
      <Image
        src="/icons/logo-icon.svg"
        alt="Логотип компанії"
        width={22.4}
        height={22.4}
      />
      <span
        className={`${css.logoText} ${variant === 'header-main-page' ? css.logoTextHeaderMain : ''}`}
      >
        Подорожники
      </span>
    </Link>
  );
}
