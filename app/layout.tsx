import 'modern-normalize/modern-normalize.css';
import './globals.css';

import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import { Nunito_Sans } from 'next/font/google';
import { Sora } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import BreakpointInitializer from '@/components/Providers/BreakpointInitializer';
import ThemeProvider from '@/components/ThemeProvider/ThemeProvider';
import { cookies } from 'next/headers';

import RootPageClient from './RootPage.client';

import { getServerMe } from '@/lib/api/serverApi';
import { User } from '@/types/user';

import ScrollToTopButton from '@/components/ScrollToTopButton/ScrollToTopButton';

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
    'Подорожники — платформа для мандрівників, де можна ділитися історіями, знаходити натхнення для нових пригод та відкривати цікаві місця світу.',
  metadataBase: new URL(
    'https://travel-fs116-teamproject-frontend-rouge.vercel.app/'
  ),

  openGraph: {
    type: 'website',
    title: 'Подорожники — Діліться враженнями від подорожей',
    description:
      'Подорожники — платформа для мандрівників, де можна ділитися історіями, надихатися досвідом інших і планувати нові пригоди.',
    url: '/',
    siteName: 'Подорожники',
    images: [
      {
        url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
        width: 1200,
        height: 630,
        alt: 'Подорожники — ілюстрація для соціальних мереж',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Подорожники — Діліться враженнями від подорожей',
    description:
      'Платформа для мандрівників, де можна знаходити натхнення та ділитися власними історіями.',
    images: [
      'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
    ],
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser: User | null = null;
  try {
    initialUser = await getServerMe();
  } catch {
    // Якщо помилка (401, 403, тощо), користувач не залогінений
    initialUser = null;
  }

  const themeCookie = (await cookies()).get('theme')?.value;
  const initialTheme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html lang="uk" data-theme={initialTheme}>
      <body className={`${nunitoSans.variable} ${sora.variable}`}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes toastFadeOut {
              from {
                opacity: 1;
              }
              to {
                opacity: 0;
              }
            }

            /* Toast container positioning - Mobile: bottom-center */
            .react-hot-toast {
              left: 50% !important;
              right: auto !important;
              transform: translateX(-50%) !important;
              bottom: 16px !important;
              top: auto !important;
            }

            /* Tablet and Desktop: bottom-right */
            @media only screen and (min-width: 768px) {
              .react-hot-toast {
                left: auto !important;
                right: 16px !important;
                transform: translateX(0) !important;
              }
            }

            /* Toast item fade animation - starts fading after 2 seconds, takes 3 seconds */
            .react-hot-toast > div[role="status"] {
              animation: toastFadeOut 3s ease-out 2s forwards !important;
            }
          `,
          }}
        />
        <BreakpointInitializer />
        <ThemeProvider initialTheme={initialTheme}>
          <TanStackProvider>
            <AuthProvider initialUser={initialUser}>
              {children}
              <Toaster
                position="bottom-center"
                gutter={16}
                containerStyle={{
                  bottom: 16,
                }}
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-nunito-sans), sans-serif',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    maxWidth: 'calc(100vw - 32px)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  },
                  success: {
                    duration: 5000,
                    iconTheme: {
                      primary: 'var(--color-primary)',
                      secondary: 'var(--color-text-primary)',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: 'var(--color-error)',
                      secondary: 'var(--color-text-primary)',
                    },
                  },
                }}
              />
              <RootPageClient />
              <ScrollToTopButton />
            </AuthProvider>
          </TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
