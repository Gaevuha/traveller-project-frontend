// Components/Header/Header.tsx

'use client';

import { usePathname } from 'next/navigation';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import css from './Header.module.css';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
// import { useBreakpointStore } from '@/lib/store/breakpointStore';
// import { useAuthStore } from '@/lib/store/authStore';
// import PublishStoryLink from '../Navigation/PublishStoryLink/PublishStoryLink';

export default function Header() {
  const isMainPage = usePathname() === '/';

  const isMobileMenuOpen = useMobileMenuOpen(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useMobileMenuOpen(
    state => state.setIsMobileMenuOpen
  );
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  // const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  // const device = useBreakpointStore(state => state.screenSize);
  // const isTablet = device === 'tablet';

  useLockScroll(isMobileMenuOpen);

  let LogoProps: 'header-main-page' | 'mobile-menu-open' | 'footer' | undefined;

  if (isMobileMenuOpen) {
    LogoProps = 'mobile-menu-open';
  }

  if (!isMobileMenuOpen && isMainPage) LogoProps = 'header-main-page';

  return (
    <>
      <header
        className={`${css.header} ${isMainPage ? css.headerMainPage : ''}`}
      >
        <div className={`container ${css.headerContainer}`}>
          <div className={css.logoWrapper}>
            <Logo variant={LogoProps} handleClick={closeMobileMenu} />
          </div>
          <div className={css.navWrapper}>
            <Navigation
              variant={isMainPage ? 'header-main-page' : 'header'}
              handleClick={closeMobileMenu}
            />
          </div>
          {/* {isAuthenticated && isTablet && (
            <li>
              <PublishStoryLink
                variant={isMainPage ? 'header-main-page' : undefined}
              />
            </li>
          )} */}
          <ThemeToggle variant={isMainPage ? 'header-main-page' : 'header'} />

          <div className={css.controls}>
            {/* <ThemeToggle variant={isMainPage ? 'header-main-page' : 'header'} /> */}
            <MobileMenuBtn
              variant={isMainPage ? 'header-main-page' : undefined}
              handleClick={setIsMobileMenuOpen}
              isOpen={isMobileMenuOpen}
            />
          </div>
        </div>
      </header>
    </>
  );
}
