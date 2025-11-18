'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TravellersStories from '../TravellersStories/TravellersStories';
import css from './PopularClient.module.css';
import { fetchStories, fetchSavedStoriesByUserId } from '@/lib/api/clientApi';
import { Story, SavedStory } from '@/types/story';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useAuthStore } from '@/lib/store/authStore';
import Loader from '@/components/Loader/Loader';

interface PopularClientProps {
  initialStories: Story[];
  withPagination?: boolean;
}

export default function PopularClient({
  initialStories,
  withPagination = true,
}: PopularClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { screenSize } = useBreakpointStore();
  const user = useAuthStore(state => state.user);
  const userId = user?._id || null;
  const isAuthenticated = !!userId;

  const { data: savedStories = [] } = useQuery<SavedStory[]>({
    queryKey: ['savedStoriesByUser', userId],
    queryFn: () => fetchSavedStoriesByUserId(userId as string),
    enabled: isAuthenticated,
  });

  let savedIds: string[] = [];

  if (isAuthenticated) {
    savedIds = savedStories.map(story => story._id);
  }

  const mergedStories: Story[] = stories.map(story => ({
    ...story,
    isFavorite: isAuthenticated ? savedIds.includes(story._id) : false,
  }));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile === null) return;

    let count = initialStories.length;
    if (window.innerWidth >= 768 && window.innerWidth < 1440)
      count = Math.min(initialStories.length, 4);
    else count = Math.min(initialStories.length, 3);

    setStories(initialStories.slice(0, count));
  }, [initialStories, isMobile]);

  if (isMobile === null) return null;

  const perPage = screenSize === 'tablet' ? 4 : 3;

  const handleLoadMore = async () => {
    if (!withPagination) return;
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const newStories = await fetchStories(nextPage, perPage);
      if (newStories.length === 0) {
        setHasMore(false);
      } else {
        setStories(prev => [...prev, ...newStories]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Помилка оримання історій:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stories">
      <div className="container">
        <h2 className={css.stories__title}>Популярні історії</h2>
        <TravellersStories
          stories={mergedStories}
          isAuthenticated={isAuthenticated}
        />
        {withPagination && hasMore && (
          <div className={css.stories__footer}>
            {loading ? (<Loader />) : (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className={css.stories__more}
              >Переглянути всі
               </button>
)}
          </div>
        )}
      </div>
       {loading && page > 1}
    </section>
  );
};
