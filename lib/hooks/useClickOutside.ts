// lib/hooks/useClickOutside.ts

import { useEffect } from 'react';

type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement | null>;
  callback: (event: MouseEvent) => void;
};

export function useClickOutside({ ref, callback }: UseClickOutsideProps) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}
