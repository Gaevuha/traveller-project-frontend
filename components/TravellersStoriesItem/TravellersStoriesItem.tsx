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
import Modal from '../Modal/Modal';

interface TravellersStoriesItemProps {
  story: Story;
  isAuthenticated: boolean;
  isMyStory?: boolean;
  onRemoveSavedStory?: (id: string) => void;
  onDeleteStory?: (id: string) => void;
  variant?: 'profileMyStories';
}

export default function TravellersStoriesItem({
  story,
  isAuthenticated,
  onRemoveSavedStory,
  onDeleteStory,
  variant,
  isMyStory,
}: TravellersStoriesItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState<boolean>(story.isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState<number>(
    story.favoriteCount
  );
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsSaved(story.isFavorite ?? false);
  }, [story.isFavorite]);

  // ✅ Функція для видалення МОЄЇ історії
  const handleDeleteMyStory = async () => {
    console.log('🔍 TravellersStoriesItem delete props:', {
      storyId: story._id,
      storyTitle: story.title,
      isMyStory,
      hasOnDeleteStory: !!onDeleteStory,
      hasOnRemoveSavedStory: !!onRemoveSavedStory,
    });

    if (!onDeleteStory) {
      console.error('❌ onDeleteStory is not defined!', {
        storyId: story._id,
        isMyStory,
        hasOnDeleteStory: !!onDeleteStory,
      });
      return;
    }

    console.log('🔄 Starting delete process for story:', {
      storyId: story._id,
      storyTitle: story.title,
      isMyStory,
    });

    if (confirm('Ви впевнені, що хочете видалити цю історію?')) {
      setIsDeleting(true);
      try {
        console.log('📤 Calling onDeleteStory with storyId:', story._id);
        await onDeleteStory(story._id);
        console.log('✅ Successfully called onDeleteStory for:', story._id);
      } catch (error) {
        console.error('❌ Error in handleDeleteMyStory:', {
          error,
          storyId: story._id,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
        toast.error('Не вдалося видалити історію');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (loading) return;

    const prevSaved = isSaved;
    const prevCount = favoriteCount;
    const nextSaved = !prevSaved;

    setIsSaved(nextSaved);
    setFavoriteCount(prevCount + (nextSaved ? 1 : -1));

    if (!nextSaved && onRemoveSavedStory) {
      onRemoveSavedStory(story._id);
    }
    setLoading(true);

    const prevSavedMe = queryClient.getQueryData<Story[]>(['savedStoriesMe']);

    try {
      if (nextSaved) {
        queryClient.setQueryData<Story[] | undefined>(
          ['savedStoriesMe'],
          prev => {
            if (!prev) return [story];
            if (prev.some(prevOne => prevOne._id === story._id)) return prev;
            return [...prev, story];
          }
        );

        await addStoryToFavorites(story._id);
      } else {
        queryClient.setQueryData<Story[] | undefined>(
          ['savedStoriesMe'],
          prev =>
            prev ? prev.filter(prevOne => prevOne._id !== story._id) : prev
        );

        await removeStoryFromFavorites(story._id);
        if (onRemoveSavedStory) {
          onRemoveSavedStory(story._id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['savedStoriesByUser'] });
      queryClient.invalidateQueries({ queryKey: ['savedStoriesMe'] });
    } catch (error) {
      console.error(error);
      setIsSaved(prevSaved);
      setFavoriteCount(prevCount);
      queryClient.setQueryData(['savedStoriesMe'], prevSavedMe);
      toast.error('Не вдалося оновити збережені історії');
    } finally {
      setLoading(false);
    }
  };

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  const categoryName = story.category?.name ?? 'Без категорії';

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
          <p className={css.story__category}>{categoryName}</p>
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
                <span className={css.story__meta}>
                  {formatDate(story.date)}
                </span>
                <span className={css.favoriteCount}>{favoriteCount}</span>
                <Icon name="icon-bookmark" className={css.icon} />
              </div>
            </div>
          </div>
          <div className={css.story__actions}>
            <Link
              href={`/stories/${story._id}`}
              className={`${css.story__btn} ${variant === 'profileMyStories' ? css.story__btn_profile : ''}`}
            >
              Переглянути статтю
            </Link>

            {/* ✅ Для МОЇХ історій - кнопки редагування та видалення */}
            {isMyStory ? (
              <>
                <button
                  onClick={() => router.push(`/stories/${story._id}/edit`)}
                  className={css.story__save}
                  title="Редагувати історію"
                  disabled={isDeleting}
                >
                  <Icon name="icon-edit" className={css.iconEdit} />
                </button>

                <button
                  onClick={handleDeleteMyStory} // ✅ ВИКОРИСТОВУЄМО ПРАВИЛЬНУ ФУНКЦІЮ
                  className={css.story__delete}
                  title="Видалити історію"
                  disabled={isDeleting}
                >
                  <Icon name="icon-trash" className={css.iconDelete} />
                </button>
              </>
            ) : (
              // ✅ Для ЗБЕРЕЖЕНИХ історій - тільки кнопка збереження
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
            )}
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
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
        isOpen={isAuthModalOpen}
      />
    </>
  );
}
