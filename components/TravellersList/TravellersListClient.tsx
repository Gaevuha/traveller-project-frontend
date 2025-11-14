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
  showLoadMoreOnMobile = false,
  customStyles,
  initialUsers,
}: TravellersListClientProps) {
  const styles = customStyles || defaultStyles;

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

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

    let count = initialUsers.length;
    if (window.innerWidth >= 1440) count = Math.min(initialUsers.length, 12);
    else if (window.innerWidth >= 768) count = Math.min(initialUsers.length, 8);
    else count = Math.min(initialUsers.length, 8);

    setUsers(initialUsers.slice(0, count));
  }, [initialUsers, isMobile]);

  if (isMobile === null) return null;

  // Load More
  const handleLoadMore = async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const offset = users.length;
      const page = Math.floor(offset / loadMorePerPage) + 1;
      const res = await getUsersClient({ page, perPage: loadMorePerPage });
      const newUsers = res.data.users ?? [];

      setUsers(prev => {
        const existingIds = new Set(prev.map(u => u._id));
        return [...prev, ...newUsers.filter(u => !existingIds.has(u._id))];
      });

      setHasMore(newUsers.length === loadMorePerPage);
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
        {users.map(user => (
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

      {hasMore && (!isMobile || showLoadMoreOnMobile) && (
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
