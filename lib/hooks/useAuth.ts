'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from '@/lib/api/clientApi';
import { extractErrorMessage } from '@/lib/api/errorHandler';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const { setUser, logout: logoutStore } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = async (values: RegisterRequest) => {
    setIsSubmitting(true);
    try {
      const user = await registerApi(values);
      if (!user) {
        throw new Error('Користувач не створений');
      }
      setUser(user);
      toast.success('Реєстрація успішна!');
      setTimeout(() => router.push('/'), 200);
    } catch (error) {
      const message = extractErrorMessage(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async (values: LoginRequest) => {
    setIsSubmitting(true);
    try {
      const user = await loginApi(values);
      if (!user) {
        throw new Error('Користувач не знайдений');
      }
      setUser(user);

      const userIdInfo = {
        id: 'id' in user ? String(user.id) : undefined,
        _id: '_id' in user ? String(user._id) : undefined,
      };

      console.log('🔵 ПІСЛЯ ЛОГІНУ - user:', user);
      console.log('🔵 user.id:', userIdInfo.id);
      console.log('🔵 user._id:', userIdInfo._id);

      toast.success(`Вітаємо, ${user.name || 'користувач'}!`);
      router.push('/');
    } catch (error) {
      const message = extractErrorMessage(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      logoutStore();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }

      await logoutApi();
      toast.success('Ви вийшли з облікового запису');
      router.push('/');
    } catch {
      logoutStore();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
      toast.success('Ви вийшли з облікового запису');
      router.push('/');
    }
  };

  return {
    register,
    login,
    logout,
    isSubmitting,
  };
};
