import { cookies } from 'next/headers';
import { api } from './api';
import { User } from '@/types/user';

/**
 * Refresh session tokens (server-side)
 * Backend expects POST /api/auth/refresh
 */
export const checkServerSession = async () => {
  const cookieStore = await cookies();

  const res = await api.post(
    '/auth/refresh',
    {},
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );
  return res;
};

/**
 * Get current user (server-side)
 */
export const getServerMe = async () => {
  const cookieStore = await cookies();
  // Backend endpoint is /users/me/profile, not /users/me
  const { data } = await api.get<User>('/users/me/profile', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return data;
};
