import { ReactNode } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import css from './Main.module.css';
import ScrollToTopButton from '@/components/ScrollToTopButton/ScrollToTopButton';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <main className={css.main}>{children}</main>
      <Footer />
    </>
  );
}
