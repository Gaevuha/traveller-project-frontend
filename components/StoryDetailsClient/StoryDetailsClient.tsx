'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSavedStoriesMe, fetchStoryByIdClient } from '@/lib/api/clientApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Image from 'next/image';
import { SaveStoryButton } from './SaveStoryButton/SaveStoryButton';
import css from "./StoryDetailsClient.module.css"


export const StoryDetailsClient = () => {
  const { storyId } = useParams<{ storyId: string }>();

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

  const initiallySaved = savedStories.some(
    savedStory => savedStory._id === story._id
  );

  return (
    <>
      <section className={css.storyDetails}>
        <div className='container'>
        <h1 className={css.title}>{story.title}</h1>
        <div className={css.wrapper}>
        <p className={css.text}>Автор статті <span className={css.addText}>{story.ownerId.name}</span></p>
        <p className={css.text}>Опубліковано <span className={css.addText}>{story.date}</span></p>
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
         {initiallySaved 
         ? (<>
            <p className={css.titleStory}>Історія вже була збережена</p>
            <p className={css.textStory}>Вона доступна у вашому профілі у розділі збережене</p>
          </>
    )
        : (<>
            <p className={css.titleStory}>Збережіть собі історію</p>
            <p className={css.textStory}>Вона буде доступна у вашому профілі у розділі збережене</p>
          </>
    )}
    <SaveStoryButton storyId={story._id} initiallySaved={initiallySaved} />
          </div>
          </div>
        </div>
      </section>
    
    </>
  );
};
