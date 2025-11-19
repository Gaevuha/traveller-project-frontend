import type { Metadata } from 'next';
import { fetchCategories, fetchStoriesServer } from '@/lib/api/serverApi';
import StoriesPageClient from '@/components/StoriesPageClient/StoriesPageClient';
import css from './Stories.module.css';

export const metadata: Metadata = {
  title: 'Усі історії мандрівників — Подорожники',
  description:
    'Перегляньте всі історії мандрівників на платформі Подорожники. Фільтруйте за категоріями, знаходьте нові маршрути та надихайтесь реальними подорожами.',

  openGraph: {
    title: 'Усі історії мандрівників — Подорожники',
    description:
      'Список історій мандрівників: популярні маршрути, реальні враження та натхнення для нових подорожей.',
    url: '/stories',
    siteName: 'Подорожники',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
        width: 1200,
        height: 630,
        alt: 'Історії мандрівників на Подорожники',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Усі історії мандрівників — Подорожники',
    description:
      'Перегляньте історії мандрівників, фільтруйте за категоріями та знаходьте натхнення для власних подорожей.',
    images: [
      'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
    ],
  },

  alternates: {
    canonical: '/stories',
  },
};

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
