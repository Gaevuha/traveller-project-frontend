'use client';

import { useEffect, useState } from 'react';
import { Story } from '@/types/story';
import TravellersStories from '../TravellersStories/TravellersStories';


interface ResponsiveTravellersStoriesProps {
  stories: Story[];
  isAuthenticated: boolean;
  desktopCount?: number;
  tabletCount?: number;
  mobileCount?: number;
}

export default function ResponsiveTravellersStories({
  stories,
  isAuthenticated,
  desktopCount = 3,
  tabletCount = 4,
  mobileCount = 2,
}: ResponsiveTravellersStoriesProps) {
  const [isReady, setIsReady] = useState(false);
  const [visibleStories, setVisibleStories] = useState<Story[]>([]);

  useEffect(() => {
    const updateStories = () => {
      const width = window.innerWidth;
      let count: number;

      if (width >= 1440) {
        count = Math.min(stories.length, desktopCount);
      } else if (width >= 768) {
        count = Math.min(stories.length, tabletCount);
      } else {
        count = Math.min(stories.length, mobileCount);
      }

      setVisibleStories(stories.slice(0, count));
      setIsReady(true);
    };

    updateStories();
    window.addEventListener('resize', updateStories);

    return () => window.removeEventListener('resize', updateStories);
  }, [stories, desktopCount, tabletCount, mobileCount]);

  if (!isReady) return null; 

  return (
    <TravellersStories
      stories={visibleStories}
      isAuthenticated={isAuthenticated}
    />
  );
}
