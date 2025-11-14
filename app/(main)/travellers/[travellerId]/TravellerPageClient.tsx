'use client';

import React, { useEffect, useRef, useState } from 'react';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import Loader from '@/components/Loader/Loader';
import type { BackendArticleFromUser, User } from '@/types/user';
import type { Story } from '@/types/story';
import styles from './TravellerPage.module.css';

interface Props {
  travellerId: string;
  user: User;
  initialArticles: BackendArticleFromUser[];
  initialPerPage?: number; // скільки карток показати спочатку
  loadMorePerPage: number; // скільки підвантажувати при кліку
  showLoadMoreOnMobile?: boolean;
}

function backendToStory(article: BackendArticleFromUser, user: User): Story {
  return {
    _id: article._id,
    img: article.img,
    title: article.title,
    article: article.title,
    date: article.date,
    favoriteCount: article.favoriteCount,
    category: { _id: '', name: '' },
    ownerId: {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl ?? '',
      articlesAmount: user.articlesAmount,
      description: user.description ?? undefined,
    },
    isFavorite: false,
  };
}

export default function TravellerPageClient({
  travellerId,
  user,
  initialArticles,
  initialPerPage = 6,
  loadMorePerPage,
  showLoadMoreOnMobile = false,
}: Props) {
  const isFetchingRef = useRef(false);
  const [visibleStories, setVisibleStories] = useState<Story[]>(() =>
    initialArticles.slice(0, initialPerPage).map(a => backendToStory(a, user))
  );
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialArticles.length, initialPerPage)
  );
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Визначаємо мобільний розмір та слухаємо resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Підлаштовуємо перший рендер під ширину екрана на клієнті
  useEffect(() => {
    const width = window.innerWidth;
    let initialCount = initialPerPage;

    if (width < 768) initialCount = Math.min(initialArticles.length, 4);
    else if (width < 1024) initialCount = Math.min(initialArticles.length, 4);
    else initialCount = Math.min(initialArticles.length, initialPerPage);

    setVisibleStories(
      initialArticles.slice(0, initialCount).map(a => backendToStory(a, user))
    );
    setVisibleCount(Math.min(initialArticles.length, initialCount));
  }, [initialArticles, initialPerPage, user]);

  const handleLoadMore = () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    const nextArticles = initialArticles.slice(
      visibleCount,
      visibleCount + loadMorePerPage
    );

    const nextStories = nextArticles.map(a => backendToStory(a, user));

    setVisibleStories(prev => [...prev, ...nextStories]);
    setVisibleCount(prev => prev + nextStories.length);

    setLoading(false);
    isFetchingRef.current = false;
  };

  const showLoadMoreButton =
    visibleCount < initialArticles.length &&
    (!isMobile || showLoadMoreOnMobile);

  return (
    <>
      <TravellersStories stories={visibleStories} isAuthenticated={false} />

      {showLoadMoreButton && (
        <div className={styles.loadMoreWrapper}>
          {loading ? (
            <Loader className={styles.loader} />
          ) : (
            <button
              className={styles.traveller__btn__more}
              onClick={handleLoadMore}
            >
              Переглянути ще
            </button>
          )}
        </div>
      )}
    </>
  );
}
