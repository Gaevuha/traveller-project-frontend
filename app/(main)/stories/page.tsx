import { fetchCategories, fetchStoriesServer } from "@/lib/api/serverApi";
import StoriesPageClient from "@/components/StoriesPageClient/StoriesPageClient";


export default async function StoriesPage() {
  
 
  const initialStories = await fetchStoriesServer(1, 9)
  const categories = await fetchCategories();
  return (
   <StoriesPageClient
      initialStories={initialStories}
      categories={categories}
     
    />
  );
}
