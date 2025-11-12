import { useEffect } from 'react';

export function useLockScroll(lock: boolean) {
  useEffect(() => {
    const body = document.body;

    if (lock) {
      const scrollY = window.scrollY;

      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflowY = 'scroll';
    } else {
      const scrollY = parseInt(body.style.top || '0') * -1;

      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflowY = '';
      body.style.paddingRight = '';

      window.scrollTo(0, scrollY);
    }
  }, [lock]);
}
