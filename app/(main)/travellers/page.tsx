// app/travellers/page.tsx

import type { Metadata } from 'next';
import TravellersList from '@/components/TravellersList/TravellersList';
import styles from './TravellersPage.module.css';

export const metadata: Metadata = {
  title: 'Мандрівники — Подорожники',
  description:
    'Сторінка зі всіма мандрівниками нашого сервісу. Перегляньте профілі, дізнайтеся історії подорожей та знайдіть натхнення для власних пригод.',

  // Open Graph (Facebook, Instagram, Telegram)
  openGraph: {
    title: 'Мандрівники — Подорожники',
    description:
      'Перегляньте список мандрівників, їхні подорожі та найкращі історії.',
    url: 'https://travel-fs116-teamproject-frontend-rouge.vercel.app/travellers',
    siteName: 'Подорожники',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
        width: 1200,
        height: 630,
        alt: 'Мандрівники',
      },
    ],
    locale: 'uk_UA',
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Мандрівники — Подорожники',
    description: 'Список мандрівників та їх найкращих історій подорожей.',
    images: [
      'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
    ],
  },

  // Canonical
  alternates: {
    canonical:
      'https://travel-fs116-teamproject-frontend-rouge.vercel.app/travellers',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function TravellersPage() {
  return (
    <section className={styles.travellers}>
      <div className="container">
        <h2 className={styles.travellers__title}>Мандрівники</h2>
        <TravellersList
          initialPerPage={12}
          loadMorePerPage={4}
          showLoadMoreOnMobile={true}
          customStyles={styles}
        />
      </div>
    </section>
  );
}
