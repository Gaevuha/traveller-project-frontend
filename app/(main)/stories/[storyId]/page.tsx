import { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import {
  fetchSavedStoriesMeServer,
  fetchStoriesServer,
  fetchStoryByIdServer,
} from '@/lib/api/serverApi';
import { StoryDetailsClient } from '@/components/StoryDetailsClient/StoryDetailsClient';
import ResponsiveTravellersStories from '@/components/StoryDetailsClient/ResponsiveTravellersStories';
import Popular from '@/components/Popular/Popular';


type storyId = {
  storyId: string;
};

type Props = {
  params: Promise<storyId>
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { storyId } = await params;
  const data = await fetchStoryByIdServer(storyId);
  const story = data;

  const title = `${story.title} — Подорожники`;
  const rawDescription =
    story.article && story.article.length > 0
      ? story.article
      : `Історія подорожі у категорії ${story.category?.name || ''}.`;

  const description =
    rawDescription.length > 200
      ? `${rawDescription.slice(0, 197)}…`
      : rawDescription;

  const imageUrl =
    story.img ||
    'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png';

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/stories/${storyId}`,
      siteName: 'Подорожники',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
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

  await queryClient.prefetchQuery({
    queryKey: ['savedStoriesMe'],
    queryFn: fetchSavedStoriesMeServer,
  });

  const popularStoriesResponse = await fetchStoriesServer(1, 12, storyId);

  const isAuthenticated = false;

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StoryDetailsClient />
      </HydrationBoundary>
      <Popular withPagination={false} />

      {/* <section className="stories">
        <div className="container">
          <h2>Популярні історії</h2>
          <ResponsiveTravellersStories
            stories={popularStoriesResponse}
            isAuthenticated={isAuthenticated}
            desktopCount={3}
            tabletCount={4}
            mobileCount={2}
          />
        </div>
      </section> */}
    </>
  );
}
