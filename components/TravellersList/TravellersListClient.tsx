'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@/types/user';
import { getUsersClient } from '@/lib/api/clientApi';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import Link from 'next/link';
import Loader from '@/components/Loader/Loader';
import defaultStyles from './TravellersList.module.css';

interface TravellersListClientProps {
  loadMorePerPage: number;
  showLoadMoreOnMobile?: boolean;
  customStyles?: typeof defaultStyles;
  initialPerPage: number;
  initialUsers: User[]; // серверні дані
}

export default function TravellersListClient({
  loadMorePerPage,
  customStyles,
  initialUsers,
}: TravellersListClientProps) {
  const styles = customStyles || defaultStyles;

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [perPage, setPerPage] = useState<number>(12); // ⭐ реальна кількість карток
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  // ⭐ Responsive логіка: змінюємо perPage при зміні ширини екрана
  useEffect(() => {
    const updatePerPage = () => {
      if (window.innerWidth >= 1440) {
        setPerPage(12);
      } else {
        setPerPage(8);
      }
    };

    updatePerPage();
    window.addEventListener('resize', updatePerPage);

    return () => window.removeEventListener('resize', updatePerPage);
  }, []);

  // Оновлюємо кількість видимих карток при зміні perPage
  useEffect(() => {
    setVisibleCount(perPage);
  }, [perPage]);

  // Масив користувачів, який реально рендериться
  const visibleUsers = users.slice(0, visibleCount);

  // -------------------------------------------------------
  // LOAD MORE
  // -------------------------------------------------------
  const handleLoadMore = async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const offset = users.length;
      const page = Math.floor(offset / loadMorePerPage) + 1;

      const res = await getUsersClient({
        page,
        perPage: loadMorePerPage,
      });

      const newUsers = res.data.users ?? [];

      setUsers(prev => {
        const existingIds = new Set(prev.map(u => u._id));
        return [...prev, ...newUsers.filter(u => !existingIds.has(u._id))];
      });

      setHasMore(newUsers.length === loadMorePerPage);

      // ⭐ Після "Load More" — збільшуємо visibleCount
      setVisibleCount(prev => prev + loadMorePerPage);
    } catch (err) {
      console.error('Помилка підвантаження користувачів:', err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      <ul className={styles.travellers__list}>
        {visibleUsers.map(user => (
          <li key={user._id} className={styles.travellers__item}>
            <TravellerInfo user={user} useDefaultStyles />
            <Link
              href={`/travellers/${user._id}`}
              className={styles.traveller__btn}
            >
              Переглянути профіль
            </Link>
          </li>
        ))}
      </ul>

      {hasMore && (
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
