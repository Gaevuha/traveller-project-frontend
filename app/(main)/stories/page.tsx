import { fetchStoriesServer } from "@/lib/api/serverApi";
import CategoriesMenu from "@/components/CategoriesMenu/CategoriesMenu";
import PopularClient from "@/components/Popular/PopularClient";

export default async function StoriesPage() {
 const initialStories = await fetchStoriesServer(1, 9)
  return (
    <>
  <h2>Історії мандрівників</h2>
      <CategoriesMenu />
      <PopularClient initialStories={initialStories}/>
      </>
  );
}
