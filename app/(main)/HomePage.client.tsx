'use client';

import BackgroundOverlay from '@/components/BackgroundOverlay/BackgroundOverlay';
import MobileMenu from '@/components/MobileMenu/MobileMenu';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useEffect, useState } from 'react';

export default function HomePageClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const screenSize = useBreakpointStore(state => state.screenSize);
  console.log(screenSize);

  // const menuContainerRef = useRef<HTMLDivElement>(null);
  // useClickOutside({
  //   ref: menuContainerRef,
  //   callback: () => setIsMobileMenuOpen(false),
  // });

  function handleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  useLockScroll(isMobileMenuOpen);

  useEffect(() => {
    if (screenSize === 'desktop') {
      setIsMobileMenuOpen(false);
    }
  }, [screenSize]);
  return (
    <>
      <MobileMenu isOpen={isMobileMenuOpen} handleClick={handleMobileMenu} />
      <BackgroundOverlay isActive={isMobileMenuOpen} />
    </>
  );
}
