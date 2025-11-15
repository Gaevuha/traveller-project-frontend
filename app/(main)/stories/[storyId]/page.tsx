import { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchStoriesServer, fetchStoryByIdServer } from '@/lib/api/serverApi';
import { StoryDetailsClient } from '@/components/StoryDetailsClient/StoryDetailsClient';
import TravellersStories from '@/components/TravellersStories/TravellersStories';

type Props = {
  params: Promise<{ storyId: string }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { storyId } = await params;
  const data = await fetchStoryByIdServer(storyId);

  return {
    title: data.title,
    description: data.article.slice(0, 25),
    openGraph: {
      title: `Найкращі історії: ${data.title}`,
      description: data.article.slice(0, 25),
      url: `https://travel-fs116-teamproject-frontend-rouge.vercel.app/api/stories/${storyId}`,
      siteName: `Подорожники: ${data.title}`,
      images: [
        {
          url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
          width: 1200,
          height: 630,
          alt: `${data.title}`,
        },
      ],
      type: 'website',
    },
  };
};

export default async function StoryDetails({ params }: Props) {
  const { storyId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryByIdServer(storyId),
  });

  const popularStoriesResponse = await fetchStoriesServer(1, 4, storyId);

  const isAuthenticated = false;

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StoryDetailsClient />
      </HydrationBoundary>

      <section className="stories">
        <div className="container">
          <h2>Популярні історії</h2>
          <TravellersStories
            stories={popularStoriesResponse}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>
    </>
  );
}
