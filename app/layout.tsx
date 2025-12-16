import 'modern-normalize/modern-normalize.css';
import './globals.css';

import { Nunito_Sans, Sora } from 'next/font/google';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider/ThemeProvider';
import BreakpointInitializer from '@/components/Providers/BreakpointInitializer';
import RootPageClient from './RootPage.client';
import ScrollToTopButton from '@/components/ScrollToTopButton/ScrollToTopButton';
import { Toaster } from 'react-hot-toast';

const nunitoSans = Nunito_Sans({
  subsets: ['cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Подорожники — Діліться враженнями від подорожей',
  description:
    'Подорожники — платформа для мандрівників, де можна ділитися історіями та знаходити натхнення.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ ЄДИНЕ server-side: тема з cookie
  const themeCookie = (await cookies()).get('theme')?.value;
  const initialTheme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html lang="uk" data-theme={initialTheme}>
      <body className={`${nunitoSans.variable} ${sora.variable}`}>
        <BreakpointInitializer />
        <TanStackProvider>
          {/* ❗ backend тут НЕ чіпаємо */}
          <AuthProvider initialUser={null}>
            <ThemeProvider initialTheme={initialTheme}>
              {children}

              <RootPageClient />
              <ScrollToTopButton />

              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 5000,
                }}
              />
            </ThemeProvider>
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
