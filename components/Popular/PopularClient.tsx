'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TravellersStories from '../TravellersStories/TravellersStories';
import css from './PopularClient.module.css';
import { fetchStories, fetchSavedStoriesByUserId } from '@/lib/api/clientApi';
import { Story, SavedStory } from '@/types/story';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useAuthStore } from '@/lib/store/authStore';
import Loader from '@/components/Loader/Loader';

interface PopularClientProps {
  initialStories: Story[]; // SSR дані
  withPagination?: boolean;
}

export default function PopularClient({
  initialStories,
  withPagination = true,
}: PopularClientProps) {
  const { screenSize } = useBreakpointStore();

  const [stories, setStories] = useState<Story[]>(initialStories);
  const [perPage, setPerPage] = useState<number>(3); // реальна кількість карток
  const [visibleCount, setVisibleCount] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);

  // ---------------------------
  // AUTH → улюблені stories
  // ---------------------------
  const user = useAuthStore(state => state.user);
  const userId = user?._id || null;
  const isAuthenticated = !!userId;

  const { data: savedStories = [] } = useQuery<SavedStory[]>({
    queryKey: ['savedStoriesByUser', userId],
    queryFn: () => fetchSavedStoriesByUserId(userId as string),
    enabled: isAuthenticated,
  });

  const savedIds = isAuthenticated ? savedStories.map(s => s._id) : [];

  const mergedStories = stories.map(story => ({
    ...story,
    isFavorite: savedIds.includes(story._id),
  }));

  // -------------------------------------------------------
  // RESPONSIVE: реальна кількість story на екрані
  // -------------------------------------------------------
  useEffect(() => {
    const updatePerPage = () => {
      if (window.innerWidth >= 1440) {
        setPerPage(3);
      } else if (window.innerWidth >= 768) {
        setPerPage(4);
      } else {
        setPerPage(initialStories.length); // мобілка показує всі
      }
    };

    updatePerPage();
    window.addEventListener('resize', updatePerPage);

    return () => window.removeEventListener('resize', updatePerPage);
  }, [initialStories.length]);

  // При зміні perPage — змінюємо visibleCount
  useEffect(() => {
    setVisibleCount(perPage);
  }, [perPage]);

  // Масив story, які реально рендеряться
  const visibleStories = mergedStories.slice(0, visibleCount);

  // -------------------------------------------------------
  // LOAD MORE
  // -------------------------------------------------------
  const handleLoadMore = async () => {
    if (!withPagination) return;
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const offset = stories.length;
      const page = Math.floor(offset / perPage) + 1;

      const newStories = await fetchStories(page, perPage);

      setStories(prev => {
        const existing = new Set(prev.map(s => s._id));
        return [...prev, ...newStories.filter(s => !existing.has(s._id))];
      });

      setHasMore(newStories.length === perPage);

      // збільшуємо видиму кількість карток
      setVisibleCount(prev => prev + perPage);
    } catch (err) {
      console.error('Помилка підвантаження історій:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  return (
    <section className="stories">
      <div className="container">
        <h2 className={css.stories__title}>Популярні історії</h2>

        <TravellersStories
          stories={visibleStories}
          isAuthenticated={isAuthenticated}
        />

        {withPagination && hasMore && (
          <div className={css.stories__footer}>
            {loading ? (
              <Loader />
            ) : (
              <button onClick={handleLoadMore} className={css.stories__more}>
                Переглянути всі
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
