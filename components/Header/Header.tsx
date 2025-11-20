'use client';

import { usePathname } from 'next/navigation';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import css from './Header.module.css';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import PublishStoryLink from '../Navigation/PublishStoryLink/PublishStoryLink';

import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useAuthStore } from '@/lib/store/authStore';

export default function Header() {
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const isMobileMenuOpen = useMobileMenuOpen(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useMobileMenuOpen(
    state => state.setIsMobileMenuOpen
  );
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  const device = useBreakpointStore(state => state.screenSize);
  const isDesktop = device === 'desktop';
  const isTablet = device === 'tablet'; // ← ДОДАЄМО

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

        {/* НАВІГАЦІЯ ДЛЯ ДЕСКТОПУ */}
        {isDesktop && (
          <div className={css.navWrapper}>
            <Navigation
              variant={isMainPage ? 'header-main-page' : 'header'}
              handleClick={closeMobileMenu}
            />
          </div>
        )}

        {!isDesktop && (
          <div className={css.controls}>
            {/* Tablet Publish Button */}
            {isTablet && isAuthenticated && (
              <div className={css.tabletPublishBtn}>
                <PublishStoryLink />
              </div>
            )}

            {/* Mobile Burger */}
            <MobileMenuBtn
              variant={isMainPage ? 'header-main-page' : undefined}
              handleClick={setIsMobileMenuOpen}
              isOpen={isMobileMenuOpen}
            />
          </div>
        )}
      </div>
    </header>
  );
}
