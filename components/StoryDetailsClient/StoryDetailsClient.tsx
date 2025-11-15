'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSavedStoriesMe, fetchStoryByIdClient } from '@/lib/api/clientApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Image from 'next/image';
import { SaveStoryButton } from './SaveStoryButton/SaveStoryButton';

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
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  console.log(`savedStories`, savedStories);
  if (isStoryLoading || isSavedLoading) return <Loader />;
  if (storyError || !story) return <ErrorMessage />;

  const initiallySaved = savedStories.some(
    savedStory => savedStory._id === story._id
  );

  return (
    <>
      <div>
        <p>HISTORY</p>
        <h1>{story.title}</h1>
        <Image
          className="story-card-image"
          src={story.img}
          alt={story.title}
          width={416}
          height={277.11}
        />
        <h2>{story.ownerId.name}</h2>
      </div>

      <SaveStoryButton storyId={story._id} initiallySaved={initiallySaved} />
    </>
  );
};
