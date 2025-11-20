'use client';

import { usePathname } from 'next/navigation';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import css from './Header.module.css';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { useBreakpointStore } from '@/lib/store/breakpointStore';

export default function Header() {
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  const isMobileMenuOpen = useMobileMenuOpen(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useMobileMenuOpen(
    state => state.setIsMobileMenuOpen
  );
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  const device = useBreakpointStore(state => state.screenSize);
  const isDesktop = device === 'desktop';

  useLockScroll(isMobileMenuOpen);

  let LogoProps: 'header-main-page' | 'mobile-menu-open' | 'footer' | undefined;
  if (isMobileMenuOpen) LogoProps = 'mobile-menu-open';
  else if (!isMobileMenuOpen && isMainPage) LogoProps = 'header-main-page';

  return (
    <header className={`${css.header} ${isMainPage ? css.headerMainPage : ''}`}>
      <div className={`container ${css.headerContainer}`}>
        <div className={css.logoAndTheme}>
          <Logo variant={LogoProps} handleClick={closeMobileMenu} />
          <ThemeToggle variant={isMainPage ? 'header-main-page' : 'header'} />
        </div>

        {/* Навігація рендериться лише на десктопі */}
        {isDesktop && (
          <div className={css.navWrapper}>
            <Navigation
              variant={isMainPage ? 'header-main-page' : 'header'}
              handleClick={closeMobileMenu}
            />
          </div>
        )}

        {/* Мобільна кнопка меню */}
        {!isDesktop && (
          <MobileMenuBtn
            variant={isMainPage ? 'header-main-page' : undefined}
            handleClick={setIsMobileMenuOpen}
            isOpen={isMobileMenuOpen}
          />
        )}
      </div>
    </header>
  );
}
