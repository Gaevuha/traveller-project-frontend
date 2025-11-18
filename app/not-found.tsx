import { Metadata } from 'next';
import css from './Home.module.css';

export const metadata: Metadata = {
  title: 'Сторінку не знайдено | Подорожники',
  description:
    'Сторінку не знайдено або вона була видалена. Поверніться на головну сторінку або перегляньте інші історії мандрівників.',
  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: 'Сторінку не знайдено | Подорожники',
    description:
      'Сторінку не знайдено або вона була видалена. Поверніться на головну сторінку або перегляньте інші історії мандрівників.',
    url: '/not-found',
    siteName: 'Подорожники',
    type: 'website',
    images: [
      {
        url: '/page-not-found.jpeg',
        width: 1200,
        height: 630,
        alt: 'Сторінку не знайдено',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Сторінку не знайдено | Подорожники',
    description:
      'Сторінку не знайдено або вона була видалена. Поверніться на головну сторінку або перегляньте інші історії мандрівників.',
    images: ['/page-not-found.jpeg'],
  },
};

export default function NotFound() {
  return (
    <>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </>
  );
}
