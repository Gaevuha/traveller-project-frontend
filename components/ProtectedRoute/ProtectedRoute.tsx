'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader/Loader';
import { useAuthStore } from '@/lib/store/authStore';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: 'var(--color-bg-primary, #fdfdfd)',
        }}
      >
        <Loader />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
