'use client';

import React, { useEffect, useRef, useState } from 'react';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import Loader from '@/components/Loader/Loader';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import type { User, BackendArticleFromUser } from '@/types/user';
import type { Story } from '@/types/story';
import { getArticlesByUserClient } from '@/lib/api/clientApi';
import styles from './TravellerPage.module.css';

interface Props {
  travellerId: string;
  user: User;
  initialArticles: BackendArticleFromUser[];
  totalArticles: number;
  loadMorePerPage: number;
  showLoadMoreOnMobile: boolean;
}

function backendToStory(article: BackendArticleFromUser, user: User): Story {
  return {
    _id: article._id,
    img: article.img,
    title: article.title,
    article: article.article,
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
  totalArticles,
}: Props) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [noStories, setNoStories] = useState(initialArticles.length === 0);
  const pageRef = useRef(1);

  // Динамічний перPage під мобілку/планшет/десктоп
  const getPerPage = () => {
    if (window.innerWidth < 1440) return 4; // мобільні + планшет
    return 6; // десктоп
  };

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1440);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Перший рендер
  useEffect(() => {
    if (isMobile === null) return;

    const perPage = getPerPage();

    if (!initialArticles || initialArticles.length === 0) {
      setNoStories(true);
      setHasMore(false);
      return;
    }

    const firstStories = initialArticles
      .slice(0, perPage)
      .map(a => backendToStory(a, user));
    setStories(firstStories);
    setNoStories(false);

    setHasMore(totalArticles > firstStories.length);
    pageRef.current = 1;
  }, [isMobile, initialArticles, totalArticles, user]);

  // LOAD MORE
  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const perPage = getPerPage(); // ✅ динамічний perPage
      const nextPage = pageRef.current + 1;

      const res = await getArticlesByUserClient(travellerId, nextPage, perPage);
      const newArticles = res.articles.items ?? [];

      if (newArticles.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const mapped = newArticles.map(a => backendToStory(a, user));

      setStories(prev => {
        const merged = [...prev, ...mapped];

        const unique = merged.filter(
          (item, index, arr) => arr.findIndex(i => i._id === item._id) === index
        );

        // ✅ ховаємо кнопку на останній сторінці
        if (unique.length >= totalArticles || newArticles.length < perPage) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        return unique;
      });

      pageRef.current = nextPage;
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  if (noStories) {
    return (
      <MessageNoStories
        text="У цього користувача ще немає історій."
        buttonText="Назад до історій"
        route="/stories"
      />
    );
  }

  if (isMobile === null) return null;

  return (
    <>
      <TravellersStories
        stories={stories}
        isAuthenticated={false}
        className={styles.travellerPageStoriesList}
      />

      {hasMore && stories.length > 0 && (
        <div className={styles.loadMoreWrapper}>
          {loading ? (
            <Loader className={styles.loader} />
          ) : (
            <button
              className={`${styles.traveller__btn__more} ${styles.myCustomBtnLoadMore}`}
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
