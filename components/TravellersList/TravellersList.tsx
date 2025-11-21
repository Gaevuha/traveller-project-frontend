// app/components/TravellersList/TravellersList.tsx

import TravellersListClient from './TravellersListClient';
import { getUsersServer } from '@/lib/api/serverApi';
import defaultStyles from './TravellersList.module.css';

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

interface Props {
  initialPerPage?: number;
  loadMorePerPage: number;
  showLoadMoreOnMobile?: boolean;
  customStyles?: typeof defaultStyles;
}

export default async function TravellersList({
  initialPerPage = 12,
  loadMorePerPage,
  showLoadMoreOnMobile = false,
  customStyles,
}: Props) {
  const queryClient = new QueryClient();

  const res = await getUsersServer(1, initialPerPage);

  await queryClient.prefetchQuery({
    queryKey: ['travellers', 1, initialPerPage],
    queryFn: async () => ({
      users: res.data.users ?? [],
      totalPages: res.data.totalPages ?? 1,
    }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TravellersListClient
        initialPerPage={initialPerPage}
        loadMorePerPage={loadMorePerPage}
        showLoadMoreOnMobile={showLoadMoreOnMobile}
        customStyles={customStyles}
        initialUsers={res.data.users ?? []}
      />
    </HydrationBoundary>
  );
}
