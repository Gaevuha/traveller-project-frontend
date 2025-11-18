'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import Loader from '@/components/Loader/Loader';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import type { User, BackendArticleFromUser } from '@/types/user';
import type { Story } from '@/types/story';
import { getArticlesByUserClient } from '@/lib/api/clientApi';
import { useQuery } from '@tanstack/react-query';
import { fetchSavedStoriesByUserId } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import styles from './TravellerPage.module.css';

interface Props {
  travellerId: string;
  user: User;
  initialArticles: BackendArticleFromUser[];
  totalArticles: number;
  loadMorePerPage?: number;
  showLoadMoreOnMobile?: boolean;
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

  // auth store
  const auth = useAuthStore(state => state.user);
  const userId = auth?._id || null;
  const isAuthenticated = !!userId;

  // fetch saved stories for THIS user
  const { data: savedStories = [] } = useQuery({
    queryKey: ['savedStoriesByUser', userId],
    queryFn: () => fetchSavedStoriesByUserId(userId!),
    enabled: isAuthenticated,
  });

  // IDs of saved stories (via useMemo)
  const savedIds = useMemo(() => {
    if (!isAuthenticated) return [];
    return savedStories.map(s => s._id);
  }, [isAuthenticated, savedStories]);

  const getPerPage = () => {
    if (window.innerWidth < 1440) return 4;
    return 6;
  };

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1440);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // INITIAL RENDER
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

  // MERGE isFavorite into stories
  const mergedStories = useMemo(() => {
    return stories.map(story => ({
      ...story,
      isFavorite: isAuthenticated ? savedIds.includes(story._id) : false,
    }));
  }, [stories, isAuthenticated, savedIds]);

  // LOAD MORE
  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const perPage = getPerPage();
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

        if (unique.length >= totalArticles || newArticles.length < perPage) {
          setHasMore(false);
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

  // NO STORIES CASE
  if (noStories) {
    return (
      <div className={styles.wrapperMessage}>
        <MessageNoStories
          text="Цей користувач ще не публікував історій"
          buttonText="Назад до історій"
          route="/stories"
        />
      </div>
    );
  }

  if (isMobile === null) return null;

  return (
    <>
      <TravellersStories
        stories={mergedStories}
        isAuthenticated={isAuthenticated}
        className={styles.travellerPageStoriesList}
      />

      {hasMore && mergedStories.length > 0 && (
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
