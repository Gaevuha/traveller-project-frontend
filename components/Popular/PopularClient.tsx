'use client';

import { useState, useEffect } from 'react';
import TravellersStories from '../TravellersStories/TravellersStories';
import css from './PopularClient.module.css';
import { fetchStories } from '@/lib/api/clientApi';
import { Story } from '@/types/story';
import { useBreakpointStore } from '@/lib/store/breakpointStore';
import { useAuthStore } from '@/lib/store/authStore';

interface PopularClientProps{
  initialStories: Story[];
}

export default function PopularClient({initialStories}: PopularClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { screenSize} = useBreakpointStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  
// Визначаємо мобільний розмір
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Адаптивне обрізання початкових користувачів
  useEffect(() => {
    if (isMobile === null) return;

    let count = initialStories.length;
    // if (window.innerWidth >= 1440) count = Math.min(initialStories.length, );
    if (window.innerWidth >= 768 && window.innerWidth < 1440 ) count = Math.min(initialStories.length, 4);
    else count = Math.min(initialStories.length, 3);

    setStories(initialStories.slice(0, count));
  }, [initialStories, isMobile]);

  if (isMobile === null) return null;
  
  
  const perPage = screenSize === 'tablet' ? 4 : 3;

  

  const handleLoadMore = async () => {
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
          stories = { stories }
          isAuthenticated={isAuthenticated}
        />
        {hasMore && (
          <div className={css.stories__footer}>
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className={css.stories__more}
            >
              {loading ? 'Завантаження...' : 'Переглянути всі'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
