'use client';

import { useState } from 'react';
import TravellersStoriesItem from '@/components/TravellersStoriesItem/TravellersStoriesItem';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import Loader from '@/components/Loader/Loader';
import styles from './TravellerPage.module.css';
import type { User, BackendArticleFromUser } from '@/types/user';
import type { Story } from '@/types/story';

interface Props {
  user: User;
  travellerId: string;
  initialArticles?: BackendArticleFromUser[];
  perPage: number;
}

export default function StoriesClient({
  user,
  travellerId,
  initialArticles = [],
  perPage,
}: Props) {
  const [allArticles, setAllArticles] =
    useState<BackendArticleFromUser[]>(initialArticles);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = Math.floor(allArticles.length / perPage) + 1;
      const res = await fetch(`/api/users/${travellerId}?page=${nextPage}`);
      const data = await res.json();
      const newArticles: BackendArticleFromUser[] = data.data.articles || [];
      setAllArticles(prev => [...prev, ...newArticles]);
    } catch (err) {
      console.error('Помилка підвантаження статей:', err);
    } finally {
      setLoading(false);
    }
  };

  if (allArticles.length === 0 && !loading) {
    return (
      <MessageNoStories
        text="У цього мандрівника поки немає історій."
        buttonText="Повернутись"
        route="/travellers"
      />
    );
  }

  // Конвертуємо BackendArticleFromUser у Story
  const renderArticles: Story[] = allArticles.map(a => ({
    _id: a._id,
    title: a.title,
    img: a.img,
    article: '', // якщо бекенд не дає тексту статті
    date: a.date,
    favoriteCount: a.favoriteCount,
    category: { _id: '1', name: 'Історія' },
    ownerId: {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl || '', // дефолт для TypeScript
    },
    isFavorite: false,
  }));

  return (
    <div className={styles.travellerStories}>
      <h2 className={styles.travellerStoriesTitle}>Історії Мандрівника</h2>

      <ul className={styles.storiesList}>
        {renderArticles.map(article => (
          <TravellersStoriesItem
            key={article._id}
            story={article}
            isAuthenticated={false}
          />
        ))}
      </ul>

      <button
        className={styles.traveller__btn__more}
        onClick={handleLoadMore}
        disabled={loading}
      >
        {loading ? 'Завантаження...' : 'Переглянути ще'}
      </button>

      {loading && <Loader className={styles.loader} />}
    </div>
  );
}
