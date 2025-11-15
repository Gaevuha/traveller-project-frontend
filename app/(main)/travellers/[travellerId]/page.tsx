import { getUserByIdServer } from '@/lib/api/serverApi';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import TravellerPageClient from './TravellerPageClient';
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';

import type { User, BackendArticleFromUser } from '@/types/user';
import styles from './TravellerPage.module.css';

interface TravellerPageProps {
  params: Promise<{ travellerId: string }>;
}

export default async function TravellerPage({ params }: TravellerPageProps) {
  const { travellerId } = await params;

  try {
    // 1. Отримуємо користувача та його статті з бекенду
    const res = await getUserByIdServer(travellerId);
    const user: User = res.data.user;
    const initialArticles: BackendArticleFromUser[] = res.data.articles;

    // 2. Створюємо QueryClient для prefetch + hydration
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['travellerStories', travellerId],
      queryFn: async () => initialArticles,
    });

    return (
      <section className={styles.travellerId}>
        <div className={`container ${styles.containerTraveller}`}>
          {/* Інформація про мандрівника */}
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

          {/* Hydration React Query */}
          <HydrationBoundary state={dehydrate(queryClient)}>
            <TravellerPageClient
              travellerId={travellerId}
              user={user}
              initialArticles={initialArticles}
              loadMorePerPage={3} // кількість карток підвантаження
              showLoadMoreOnMobile={true} // показати кнопку на мобільних
            />
          </HydrationBoundary>
        </div>
      </section>
    );
  } catch (err) {
    console.error('Помилка отримання мандрівника:', err);
    return <p>Сталася помилка при завантаженні даних.</p>;
  }
}
