// src/stores/useScreenStore.js

import { ScreenSize } from '@/constants/constants';
import { create } from 'zustand';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

type BreakpointStore = {
  screenSize: ScreenSize | undefined;
  setScreenSize: (width: number) => void;
  screenSizeReady: boolean;
};

export const useBreakpointStore = create<BreakpointStore>()(set => ({
  screenSize: undefined,
  screenSizeReady: false,
  setScreenSize: (width: number) =>
    set(() => ({ screenSize: getScreenSize(width), screenSizeReady: true })),
}));

function getScreenSize(width: number): ScreenSize {
  if (width >= ScreenSize.Desktop) return 'desktop';
  if (width >= ScreenSize.Tablet) return 'tablet';
  return 'mobile';
}
