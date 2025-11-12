// Components/Header/Header.tsx

'use client';

import { usePathname } from 'next/navigation';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import css from './Header.module.css';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';
import { useEffect, useState } from 'react';
import MobileMenu from '../MobileMenu/MobileMenu';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { useBreakpointStore } from '@/lib/store/breakpointStore';

export default function Header() {
  const isMainPage = usePathname() === '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const screenSize = useBreakpointStore(state => state.screenSize);
  console.log(screenSize);

  function handleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  useLockScroll(isMobileMenuOpen);

  useEffect(() => {
    if (screenSize === 'desktop') {
      setIsMobileMenuOpen(false);
    }
  }, [screenSize]);

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
          <Logo variant={LogoProps} />
          <Navigation variant={isMainPage ? 'header-main-page' : 'header'} />
          <MobileMenuBtn
            variant={isMainPage ? 'header-main-page' : undefined}
            handleClick={handleMobileMenu}
            isOpen={isMobileMenuOpen}
          />
        </div>
      </header>
      <MobileMenu isOpen={isMobileMenuOpen} />
    </>
  );
}
