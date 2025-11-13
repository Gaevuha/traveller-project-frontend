'use client';

import BackgroundOverlay from '@/components/BackgroundOverlay/BackgroundOverlay';
import MobileMenu from '@/components/MobileMenu/MobileMenu';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';
import { useEffect } from 'react';

export default function RootPageClient() {
  const isMobileMenuOpen = useMobileMenuOpen(state => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useMobileMenuOpen(
    state => state.setIsMobileMenuOpen
  );
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  const screenSize = useBreakpointStore(state => state.screenSize);

  useLockScroll(isMobileMenuOpen);

  // const menuContainerRef = useRef<HTMLDivElement>(null);
  // useClickOutside({
  //   ref: menuContainerRef,
  //   callback: () => setIsMobileMenuOpen(false),
  // });

  // useLockScroll(isMobileMenuOpen);

  useEffect(() => {
    if (screenSize && screenSize === 'desktop') {
      closeMobileMenu();
    }
  }, [screenSize]);

  return (
    <>
      <MobileMenu isOpen={isMobileMenuOpen} handleClick={setIsMobileMenuOpen} />
      <BackgroundOverlay isActive={isMobileMenuOpen} />
    </>
  );
}
