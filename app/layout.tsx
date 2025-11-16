import 'modern-normalize/modern-normalize.css';
import './globals.css';

import TanStackProvider from '@/components/TanStackProvider/TanStackProvider';
import { Nunito_Sans } from 'next/font/google';
import { Sora } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import BreakpointInitializer from '@/components/Providers/BreakpointInitializer';

import RootPageClient from './RootPage.client';

import { getServerMe } from '@/lib/api/serverApi';
import { User } from '@/types/user';

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
    'Платформа для мандрівників, де можна ділитися враженнями від подорожей, знаходити натхнення для нових пригод та відкривати цікаві місця.',
  openGraph: {
    title: 'Подорожники — Діліться враженнями від подорожей',
    description: 'NoteHub helps you create, browse and search personal notes.',
    url: 'https://localhost:3000',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'Подорожники',
      },
    ],
    type: 'website',
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

  return (
    <html lang="uk">
      <body className={`${nunitoSans.variable} ${sora.variable}`}>
        <BreakpointInitializer />
        <TanStackProvider>
          <AuthProvider initialUser={initialUser}>
            {children}
            <Toaster
              position="top-right"
              gutter={16}
              containerStyle={{
                top: 16,
                right: 16,
                bottom: 16,
                left: 16,
              }}
              toastOptions={{
                duration: 4000,
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
                  duration: 3000,
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
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
