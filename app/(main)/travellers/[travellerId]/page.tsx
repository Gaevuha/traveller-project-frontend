import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import StoriesClient from './StoriesClient';
import { getUserByIdServer } from '@/lib/api/serverApi';
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import styles from './TravellerPage.module.css';
import type { User, BackendArticleFromUser } from '@/types/user';

interface TravellerPageProps {
  params: { travellerId: string };
}

export default async function TravellerPage({ params }: TravellerPageProps) {
  const { travellerId } = params;
  const queryClient = new QueryClient();
  const PER_PAGE = 4;

  try {
    const res = await getUserByIdServer(travellerId);
    const user = res.data.user as User;
    const initialArticles = res.data.articles as BackendArticleFromUser[];

    // Prefetch для React Query
    await queryClient.prefetchQuery({
      queryKey: ['travellerStories', travellerId, 1, PER_PAGE],
      queryFn: async () => initialArticles,
    });

    return (
      <section className={styles.travellerId}>
        <div className={`container ${styles.containerTraveller}`}>
          <TravellerInfo
            user={user}
            useDefaultStyles={false}
            priority
            className={{
              wrapper: styles.wrapperContent,
              container: styles.travellerContainer,
              name: styles.travellerName,
              text: styles.travellerText,
            }}
            imageSize={{ width: 199, height: 199 }}
          />

          <HydrationBoundary state={dehydrate(queryClient)}>
            <StoriesClient
              travellerId={travellerId}
              user={user}
              perPage={PER_PAGE}
              initialArticles={initialArticles} // передаємо "рідні" дані бекенду
            />
          </HydrationBoundary>
        </div>
      </section>
    );
  } catch (err) {
    console.error('Помилка отримання мандрівника:', err);
    return null;
  }
}
