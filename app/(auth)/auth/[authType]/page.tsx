import { notFound } from 'next/navigation';
import AuthLayout from '@/components/AuthForms/AuthLayout/AuthLayout';
import RegistrationForm from '@/components/AuthForms/RegistrationForm/RegistrationForm';
import LoginForm from '@/components/AuthForms/LoginForm/LoginForm';
import AuthRoute from '@/components/AuthRoute/AuthRoute';
import { Metadata } from 'next';

type AuthPageParams = {
  authType: string;
};

type AuthPageProps = {
  params: Promise<AuthPageParams>;
};

export async function generateMetadata({
  params,
}: AuthPageProps): Promise<Metadata> {
  const { authType } = await params;

  const titles = {
    register: 'Реєстрація | Подорожники',
    login: 'Вхід | Подорожники',
  };

  const descriptions = {
    register: 'Зареєструйтеся та приєднайтесь до спільноти мандрівників.',
    login: 'Увійдіть до спільноти мандрівників України.',
  };

  return {
    title: titles[authType as keyof typeof titles] || 'Подорожники',
    description:
      descriptions[authType as keyof typeof descriptions] ||
      'Подорожники — платформа для мандрівників.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: titles[authType as keyof typeof titles] || 'Подорожники',
      description:
        descriptions[authType as keyof typeof descriptions] ||
        'Подорожники — платформа для мандрівників.',
      url: `/auth/${authType}`,
      siteName: 'Подорожники',
      images: [
        {
          url: 'https://res.cloudinary.com/dcyt4kr5s/image/upload/v1763071406/hg4accqwhzuuabjoko4a.png',
          width: 1200,
          height: 630,
          alt: 'Подорожники',
        },
      ],
      locale: 'uk_UA',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[authType as keyof typeof titles] || 'Подорожники',
      description:
        descriptions[authType as keyof typeof descriptions] ||
        'Подорожники — платформа для мандрівників.',
    },
  };
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { authType } = await params;

  if (authType !== 'register' && authType !== 'login') {
    notFound();
  }

  return (
    <AuthRoute>
      <AuthLayout>
        {authType === 'register' ? <RegistrationForm /> : <LoginForm />}
      </AuthLayout>
    </AuthRoute>
  );
}
