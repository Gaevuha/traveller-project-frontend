// app/travellers/[travellerId]/page.tsx

import type { Metadata } from 'next';
import TravellerPageClient from './TravellerPageClient';
import {
  getArticlesByUserServer,
  getUserByIdServer,
} from '@/lib/api/serverApi';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { BackendArticleFromUser, User } from '@/types/user';
import styles from './TravellerPage.module.css';

interface TravellerPageProps {
  params: Promise<{ travellerId: string }>;
}

interface GenerateMetadataProps {
  params: Promise<{ travellerId: string }>;
}

export const generateMetadata = async ({
  params,
}: GenerateMetadataProps): Promise<Metadata> => {
  const { travellerId } = await params;

  const res = await getUserByIdServer(travellerId);
  const user = res.data.user;

  const title = `Подорожник ${user.name}`;
  const description = `Перегляньте профіль мандрівника ${user.name} та його найкращі історії подорожей.`;
  const pageUrl = `https://travel-fs116-teamproject-frontend-rouge.vercel.app/travellers/${travellerId}`;
  const imageUrl =
    user.avatarUrl ||
    'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png';

  return {
    title,
    description,

    // Open Graph (Facebook, Instagram, Telegram)
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Подорожники',
      type: 'profile',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: user.name,
        },
      ],
      locale: 'uk_UA',
    },

    // Twitter / X
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    // Canonical
    alternates: {
      canonical: pageUrl,
    },

    // Icons
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
};

export default async function TravellerPage({ params }: TravellerPageProps) {
  const { travellerId } = await params;

  try {
    const queryClient = new QueryClient();

    // RSC: запит на сервері
    const res = await getArticlesByUserServer(travellerId, 1, 6);

    await queryClient.prefetchQuery({
      queryKey: ['travellerStories', travellerId],
      queryFn: async () => res.articles.items,
    });

    const user: User = res.user;
    const initialArticles: BackendArticleFromUser[] = res.articles.items;
    const totalArticles = res.totalArticles;

    return (
      <section className={styles.travellerId}>
        <div className={`container ${styles.containerTraveller}`}>
          <TravellerInfo
            user={user}
            useDefaultStyles={false}
            priority
            className={{
              travellerInfoWraper: styles.travellerInfoWraper,
              image: styles.image,
              wrapper: styles.wrapperContent,
              container: styles.travellerContainer,
              name: styles.travellerName,
              text: styles.travellerText,
            }}
            imageSize={{ width: 199, height: 199 }}
          />

          <h2 className={styles.travellerStoriesTitle}>Історії Мандрівника</h2>

          <HydrationBoundary state={dehydrate(queryClient)}>
            <TravellerPageClient
              travellerId={travellerId}
              user={user}
              initialArticles={initialArticles}
              totalArticles={totalArticles}
              loadMorePerPage={6}
              showLoadMoreOnMobile={true}
            />
          </HydrationBoundary>
        </div>
      </section>
    );
  } catch (err) {
    console.error('[TravellerPage] Помилка отримання мандрівника:', err);
    return <p>Сталася помилка при завантаженні даних.</p>;
  }
}
