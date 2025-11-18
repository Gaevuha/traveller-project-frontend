'use client';

import { useEffect, useState } from 'react';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import CategoriesMenu from '@/components/CategoriesMenu/CategoriesMenu';
import Loader from '@/components/Loader/Loader';
import { fetchStories } from '@/lib/api/clientApi';
import css from './StoriesPageClient.module.css';
import { Category, Story } from '@/types/story';

interface Props {
  initialStories: Story[];
  categories: Category[];
}

export default function StoriesPageClient({
  initialStories,
  categories,
}: Props) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [page, setPage] = useState(1);

  const [categoryId, setCategoryId] = useState<string>('all');

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1440);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const PER_PAGE = isTablet ? 8 : 9;
  const FIRST_LOAD = PER_PAGE;

  useEffect(() => {
    setStories(initialStories.slice(0, FIRST_LOAD));
    setPage(1);
    setHasMore(initialStories.length >= FIRST_LOAD);
  }, [initialStories, isTablet, FIRST_LOAD]);

  if (isTablet === null) return null;

  const handleCategoryChange = async (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setLoading(true);
    try {
      const categoryParam = newCategoryId === 'all' ? undefined : newCategoryId;
      const data = await fetchStories(1, PER_PAGE, categoryParam);

      setStories(data);
      setPage(1);
      setHasMore(data.length === PER_PAGE);
    } catch (error) {
      console.error('Помилка отримання історії за категорією:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const categoryParam = categoryId === 'all' ? undefined : categoryId;
      const newStories = await fetchStories(nextPage, PER_PAGE, categoryParam);

      if (newStories.length === 0) {
        setHasMore(false);
      } else {
        setStories(prev => [...prev, ...newStories]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Помилка завантаження ще:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className={css.title}>Історії Мандрівників</h1>

      <CategoriesMenu
        categories={categories}
        value={categoryId}
        onChange={handleCategoryChange}
      />

      {/* {loading && page === 1 && <Loader />} */}

      <TravellersStories
        stories={stories}
        className={css.storiesList}
        isAuthenticated={false}
      />

      {hasMore && stories.length > 0 && (
        <div className={css.loadMoreWrapper}>
          {loading ? (
            <Loader className={css.loader} />
          ) : (
            <button
              className={`${css.traveller__btn__more} ${css.stories__more}`}
              onClick={handleLoadMore}
              disabled={loading}
            >
              Переглянути ще
            </button>
          )}
        </div>
      )}
    </>
  );
}
