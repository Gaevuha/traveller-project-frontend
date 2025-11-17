// app/travellers/[travellerId]/page.tsx
import TravellerPageClient from './TravellerPageClient';
import { getArticlesByUserServer } from '@/lib/api/serverApi';
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
