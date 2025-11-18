import { fetchCategories, fetchStoriesServer } from '@/lib/api/serverApi';
import StoriesPageClient from '@/components/StoriesPageClient/StoriesPageClient';
import css from './Stories.module.css';

export default async function StoriesPage() {
  const initialStories = await fetchStoriesServer(1, 9);
  const categories = await fetchCategories();
  return (
    <section className={css.stories}>
      <div className="container">
        <StoriesPageClient
          initialStories={initialStories}
          categories={categories}
        />
      </div>
    </section>
  );
}
