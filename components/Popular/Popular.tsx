import PopularClient from '../Popular/PopularClient';
import { fetchStoriesServer } from '@/lib/api/serverApi';

interface PopularProps {
  withPagination?: boolean;
}

export default async function Popular({ withPagination }: PopularProps) {
  const initialStories = await fetchStoriesServer(1, 4);

  return (
    <PopularClient
      initialStories={initialStories}
      withPagination={withPagination}
    />
  );
}
