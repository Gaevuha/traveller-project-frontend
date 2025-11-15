import PopularClient from '../Popular/PopularClient';
import { fetchStoriesServer } from '@/lib/api/serverApi';



export default async function Popular() {
  
  const initialStories = await fetchStoriesServer(1, 4);

  return <PopularClient initialStories={initialStories} />;
}