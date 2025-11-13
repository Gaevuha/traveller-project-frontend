'use client';

import Link from 'next/link';
import css from './Navigation.module.css';
import AuthNavigation from '../AuthNavigation/AuthNavigation';
// import { useAuthStore } from '@/lib/store/authStore';
// import { useBreakpointStore } from '@/lib/store/breakpointStore';

type NavProps = {
  variant?: 'header' | 'header-main-page' | 'footer' | 'mobile-menu';
  handleClick: () => void;
};

const navItems = [
  { href: '/', label: 'Головна' },
  { href: '/stories', label: 'Історії' },
  { href: '/travellers', label: 'Мандрівники' },
];

export default function Navigation({ variant, handleClick }: NavProps) {
  function getNavClass() {
    switch (variant) {
      case 'footer':
        return css.navFooter;
      case 'header':
      case 'header-main-page':
        return css.navHeader;
      default:
        return '';
    }
  }

  function getNavListClass() {
    return variant === 'footer' ? css.navListFooter : '';
  }
  function getNavItemClass() {
    if (variant === 'header-main-page') return css.navItemHeaderMain;
    if (variant === 'footer') return css.navItemFooter;
    if (variant === 'mobile-menu') return css.navItemMobileMenu;
  }
  function getNavLinkClass() {
    if (variant === 'footer') return css.navLinkFooter;
    return variant === 'header-main-page' ? css.navLinkHeaderMain : '';
  }
  return (
    <nav className={`${css.nav} ${getNavClass()}`}>
      <ul className={`${css.navList} ${getNavListClass()}`}>
        {navItems.map(({ href, label }) => (
          <li key={label} className={`${css.navItem} ${getNavItemClass()}`}>
            <Link
              href={href}
              className={`${css.navLink} ${getNavLinkClass()}`}
              onClick={handleClick}
            >
              {label}
            </Link>
          </li>
        ))}

        {variant === 'header-main-page' && (
          <AuthNavigation
            variant="header-main-page"
            handleClick={handleClick}
          />
        )}
        {variant === 'header' && <AuthNavigation handleClick={handleClick} />}
        {variant === 'mobile-menu' && (
          <AuthNavigation variant="mobile-menu" handleClick={handleClick} />
        )}
      </ul>
    </nav>
  );
}
