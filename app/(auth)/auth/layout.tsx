import type { Metadata } from 'next';
import AuthRoute from '@/components/AuthRoute/AuthRoute';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Авторизація | Подорожники',
  description: 'Вхід або реєстрація на платформі Подорожники.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface AuthLayoutWrapperProps {
  children: ReactNode;
}

export default function AuthLayoutWrapper({
  children,
}: AuthLayoutWrapperProps) {
  return <AuthRoute>{children}</AuthRoute>;
}
