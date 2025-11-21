'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSavedStoriesMe, fetchStoryByIdClient } from '@/lib/api/clientApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Image from 'next/image';
import { SaveStoryButton } from './SaveStoryButton/SaveStoryButton';
import { useAuthStore } from '@/lib/store/authStore';
import css from './StoryDetailsClient.module.css';

function formatDate(dateString: string): string {
  return dateString.slice(0, 10);
}

export const StoryDetailsClient = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const user = useAuthStore(state => state.user);
  const userId = user?._id || null;

  const {
    data: story,
    isLoading: isStoryLoading,
    error: storyError,
  } = useQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryByIdClient(storyId),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: savedStories = [],
    isLoading: isSavedLoading,
    error: savedError,
  } = useQuery({
    queryKey: ['savedStoriesMe'],
    queryFn: fetchSavedStoriesMe,
    retry: false,
  });

  if (isStoryLoading || isSavedLoading) return <Loader />;
  if (storyError || !story) return <ErrorMessage />;

  //пеевірка чи моя це історія
  const isOwner = !!userId && story.ownerId._id === userId;

  // вже збережена тільки якщо не моя історія
  const initiallySaved =
    !isOwner && savedStories.some(savedStory => savedStory._id === story._id);

  return (
    <section className={css.storyDetails}>
      <div className="container">
        <h1 className={css.title}>{story.title}</h1>

        <div className={css.wrapper}>
          <p className={css.text}>
            Автор статті{' '}
            <span className={css.addText}>{story.ownerId.name}</span>
          </p>
          <p className={css.text}>
            Опубліковано{' '}
            <span className={css.addText}>{formatDate(story.date)}</span>
          </p>
          <p className={css.textCategory}>{story.category.name}</p>
        </div>

        <div className={css.storyImageWrapper}>
          <Image
            className={css.storyCardImage}
            src={story.img}
            alt={story.title}
            fill
          />
        </div>

        <div className={css.wrapperButton}>
          <p className={css.mainText}>{story.article}</p>

          <div className={css.saveStory}>
            {isOwner ? (
              <>
                <p className={css.titleStory}>Це ваша історія</p>
                <p className={css.textStory}>
                  Власні історії не можна зберігати в розділ «Збережене».
                </p>
                <button className={css.button} type="button" disabled>
                  Зберегти
                </button>
              </>
            ) : (
              <>
                {initiallySaved ? (
                  <>
                    <p className={css.titleStory}>Історія вже була збережена</p>
                    <p className={css.textStory}>
                      Вона доступна у вашому профілі у розділі «Збережене».
                    </p>
                  </>
                ) : (
                  <>
                    <p className={css.titleStory}>Збережіть собі історію</p>
                    <p className={css.textStory}>
                      Вона буде доступна у вашому профілі у розділі «Збережене».
                    </p>
                  </>
                )}

                <SaveStoryButton
                  storyId={story._id}
                  initiallySaved={initiallySaved}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

