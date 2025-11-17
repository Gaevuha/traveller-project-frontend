'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Story } from '@/types/story';
import {
  addStoryToFavorites,
  removeStoryFromFavorites,
} from '@/lib/api/clientApi';
import css from './TravellersStoriesItem.module.css';
import { Icon } from '../Icon/Icon';
import Link from 'next/link';
import Modal from '../Modal/Modal'

interface TravellersStoriesItemProps {
  story: Story;
  isAuthenticated: boolean;
}

export default function TravellersStoriesItem({
  story,
  isAuthenticated,
}: TravellersStoriesItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState<boolean>(story.isFavorite ?? false);
  // const [isSaving, setIsSaving] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState<number>(story.favoriteCount);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
    setIsSaved(story.isFavorite ?? false);
  }, [story.isFavorite]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (loading) return;

    
    const prevSaved = isSaved;
    const prevCount = favoriteCount;
    const nextSaved = !prevSaved;

    // оптимістичне оновлення UI в самій картці
    setIsSaved(nextSaved);
    setFavoriteCount(prevCount + (nextSaved ? 1 : -1));
    setLoading(true);

        const prevSavedMe = queryClient.getQueryData<Story[]>(['savedStoriesMe']);

    try {
      if (nextSaved) {
        // пушимо цю історію в кеш savedStoriesMe
        queryClient.setQueryData<Story[] | undefined>(
          ['savedStoriesMe'],
          (prev) => {
            if (!prev) return [story];
            if (prev.some((prevOne) => prevOne._id === story._id)) return prev;
            return [...prev, story];
          }
        );

        await addStoryToFavorites(story._id);
      } else {
        // прибираємо історію з кешу savedStoriesMe
        queryClient.setQueryData<Story[] | undefined>(
          ['savedStoriesMe'],
          (prev) => (prev ? prev.filter((prevOne) => prevOne._id !== story._id) : prev)
        );

        await removeStoryFromFavorites(story._id);
      }
      queryClient.invalidateQueries({ queryKey: ['savedStoriesByUser'] });
      queryClient.invalidateQueries({ queryKey: ['savedStoriesMe'] });
    } catch (error) {
      console.error(error);

      //  відкат UI якщо зламаэться
      setIsSaved(prevSaved);
      setFavoriteCount(prevCount);

      // відкат кешу savedStoriesMe якщо зламаэться
      queryClient.setQueryData(['savedStoriesMe'], prevSavedMe);

      toast.error('Не вдалося оновити збережені історії');
    } finally {
      setLoading(false);
    }
  };





  // const handleSave = async () => {
  //   if (!isAuthenticated) {
  //     router.push('/auth/register');
  //     return;
  //   }

  //   try {
  //     setIsSaving(true);
  //     if (!isSaved) {
  //       await addStoryToFavorites(story._id);
  //       setFavoriteCount(prev => prev + 1);
  //       setIsSaved(true);
  //       toast.success('Додано до збережених!');
  //     } else {
  //       await removeStoryFromFavorites(story._id);
  //       setFavoriteCount(prev => prev - 1);
  //       setIsSaved(false);
  //       toast('Видалено із збережених');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  function formatDate(dateString: string) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`; 
  };


 

  return (
    <>
    <li className={css.story}>
      <Image
        src={story.img}
        alt={story.title}
        width={400}
        height={200}
        className={css.story__img}
      />

      <div className={css.story__content}>
        <p className={css.story__category}>{story.category.name}</p>
        <h3 className={css.story__title}>{story.title}</h3>
        <p className={css.story__text}>{story.article}</p>

        <div className={css.story__author}>
          <Image
            src={story.ownerId.avatarUrl}
            alt="Автор"
            width={48}
            height={48}
            className={css.story__avatar}
          />
          <div className={css.story__info}>
            <p className={css.story__name}>{story.ownerId.name}</p>
            <div className={css.meta}>
              <span className={css.story__meta}>{formatDate(story.date)}</span>
              <span className={css.favoriteCount}>{favoriteCount}</span>
              <Icon name="icon-bookmark" className={css.icon} />
            </div>
          </div>
        </div>
        <div className={css.story__actions}>
          <Link
            href={`/stories/${story._id}`}
            className={css.story__btn}
          >
            Переглянути статтю
          </Link>

          <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`${css.story__save} ${isSaved ? css.saved : ''}`}
          >
            <Icon
              name="icon-bookmark"
              className={`${isSaved ? css.icon__saved : css.icon__bookmark}`}
            />
          </button>
        </div>
      </div>
    </li>
          <Modal
        title="Помилка під час збереження"
        message="Щоб зберегти статтю вам треба увійти, якщо ще немає облікового запису — зареєструйтесь."
        confirmButtonText="Зареєструватись"
        cancelButtonText="Увійти"
        onConfirm={() => {
          setIsAuthModalOpen(false);
          router.push('/auth/register');
        }}
        onCancel={() => {
          setIsAuthModalOpen(false);
          router.push('/auth/login');
        }}
        isOpen={isAuthModalOpen}
      />
</>
  );
}
