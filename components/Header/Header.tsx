// Components/Header/Header.tsx

'use client';

import { usePathname } from 'next/navigation';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import css from './Header.module.css';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';

export default function Header() {
  const isMainPage = usePathname() === '/';

  const isMobileMenuOpen = useMobileMenuOpen(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useMobileMenuOpen(
    state => state.setIsMobileMenuOpen
  );
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  const screenSize = useBreakpointStore(state => state.screenSize);
  console.log(screenSize);

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
          <Navigation
            variant={isMainPage ? 'header-main-page' : 'header'}
            handleClick={closeMobileMenu}
          />
          <MobileMenuBtn
            variant={isMainPage ? 'header-main-page' : undefined}
            handleClick={setIsMobileMenuOpen}
            isOpen={isMobileMenuOpen}
          />
        </div>
      </header>
    </>
  );
}
