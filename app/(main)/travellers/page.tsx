// app/travellers/page.tsx

import type { Metadata } from 'next';
import TravellersList from '@/components/TravellersList/TravellersList';
import styles from './TravellersPage.module.css';

export const metadata: Metadata = {
  title: 'Мандрівники — Подорожники',
  description:
    'Перегляньте список мандрівників, їхні історії подорожей та знайдіть натхнення для власних пригод на платформі Подорожники.',

  openGraph: {
    title: 'Мандрівники — Подорожники',
    description:
      'Список мандрівників, їхні подорожі та найкращі історії з усього світу.',
    url: '/travellers',
    siteName: 'Подорожники',
    type: 'website',
    locale: 'uk_UA',
    images: [
      {
        url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
        width: 1200,
        height: 630,
        alt: 'Подорожники — зображення для соціальних мереж',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Мандрівники — Подорожники',
    description:
      'Сторінка зі всіма мандрівниками та їх найкращими історіями подорожей.',
    images: [
      'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
    ],
  },

  alternates: {
    canonical: '/travellers',
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
