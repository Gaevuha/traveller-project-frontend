
import {
  User,
  GetUsersResponse,
  GetUserByIdResponse,
  GetArticlesResponse,
  ArticlesWithPagination,
  PaginationData,
} from '@/types/user';

import { LoginRequest, RegisterRequest } from '@/types/auth';
import { extractUser } from './errorHandler';

import {
  SavedStory,
  StoriesResponse,
  Story,
  StoryByIdResponse,
  UserSavedArticlesResponse,
} from '@/types/story';
import { AxiosError, isAxiosError } from 'axios';
import { api } from '../api/api';

export type ApiError = AxiosError<{ error: string }>;

/**
 * Register user
 */
export const register = async (data: RegisterRequest) => {
  const res = await api.post<User>('/auth/register', data);
  const user = extractUser(res.data) as User | null;
  return user;
};

/**
 * Login user
 */
export const login = async (data: LoginRequest) => {
  const res = await api.post<User>('/auth/login', data);
  const user = extractUser(res.data) as User | null;

  return user;
};

/**
 * Google OAuth — отримання URL для входу через Google
 */
export async function getGoogleAuthUrl(): Promise<string> {
  const { data } = await api.get('/auth/google/get-oauth-url');
  // сервер возвращает data.data.url, а не data.url
  return data?.data?.url || '';
}

/**
 * Підтвердження входу після редіректу з Google
 */
export const authConfirmGoogle = async (code: string) => {
  try {
    const res = await api.post<User>('/auth/google/confirm-oauth', { code });
    const user = extractUser(res.data) as User | null;
    return user;
  } catch (error) {
    console.error('❌ Google OAuth confirm error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getMe = async (silent: boolean = false) => {
  try {
    const response = await api.get('/users/me');

    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data && response.data.data) {
        const userData = response.data.data;
        if (
          userData &&
          typeof userData === 'object' &&
          '_id' in userData &&
          'name' in userData
        ) {
          return userData as User;
        }
      }

      const user = extractUser(response.data) as User | null;
      if (user) {
        return user;
      }
    }

    return null;
  } catch (error) {
    if (silent) {
      // Тиха обробка - не логуємо помилку
      return null;
    }
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      // 401 - це очікувано, якщо користувач не залогінений
      // Не логуємо як помилку
      return null;
    }

    // ✅ Логуємо інші помилки
    console.error('❌ Error in getMe:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors on logout
  }
};

/**
 * Try to refresh session on the client (will set cookies via Next API route)
 */
export async function refreshSession(): Promise<boolean> {
  try {
    await api.post('/auth/refresh', {});
    return true;
  } catch {
    return false;
  }
}
/**
 * Check if session is valid (lightweight check)
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking session via /api/users/me');
    const response = await api.get('/users/me');
    console.log('✅ Session check response:', response.status);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.log('Session check failed:', error);

    return false;
  }
};

export async function fetchStories(
  page = 1,
  perPage = 3,
  categoryId?: string
): Promise<Story[]> {
  const response = await api.get<StoriesResponse>(`/stories`, {
    params: { page, perPage, sort: 'favoriteCount', category: categoryId },
  });
  return response.data?.data || [];
}

export async function addStoryToFavorites(storyId: string): Promise<void> {
  await api.post(`/users/me/saved/${storyId}`);
}

export async function removeStoryFromFavorites(storyId: string): Promise<void> {
  await api.delete(`/users/me/saved/${storyId}`);
}
/*Haievoi Serhii*/
export async function getUsersClient({
  page = 1,
  perPage = 4,
}: {
  page: number;
  perPage: number;
}): Promise<GetUsersResponse> {
  const res = await api.get<GetUsersResponse>('/users', {
    params: { page, perPage },
  });
  return res.data;
}
export async function getArticlesByUserClient(
  travellerId: string,
  page: number,
  perPage: number
): Promise<GetArticlesResponse> {
  try {
    console.log(`[getArticlesByUserClient] Starting request:`, {
      travellerId,
      page,
      perPage,
      timestamp: new Date().toISOString(),
    });

    const url = `/users/${travellerId}`;
    console.log(`[getArticlesByUserClient] Request URL: ${url}`);

    const res = await api.get<GetUserByIdResponse>(url, {
      params: { page, perPage },
    });

    console.log(`[getArticlesByUserClient] Response received:`, {
      status: res.status,
      statusText: res.statusText,
      dataStructure: {
        hasData: !!res.data,
        hasUser: !!res.data?.data?.user,
        hasArticles: !!res.data?.data?.articles,
        articlesType: typeof res.data?.data?.articles,
        articlesIsArray: Array.isArray(res.data?.data?.articles),
      },
      articlesCount: res.data?.data?.articles?.items?.length || 0,
    });

    const articles: ArticlesWithPagination = res.data.data.articles;
    const totalArticles = articles.pagination.totalItems;

    console.log(`[getArticlesByUserClient] Request successful:`, {
      user: res.data.data.user.name,
      articlesCount: articles.items.length,
      totalArticles,
      pagination: articles.pagination,
    });

    return {
      user: res.data.data.user,
      articles: articles,
      totalArticles: totalArticles,
    };
  } catch (error: unknown) {
    console.error('[getArticlesByUserClient] Full error details:', error);

    if (isAxiosError(error)) {
      console.error('[getArticlesByUserClient] Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        headers: error.config?.headers,
      });

      // Додамо перевірку на 500 помилку
      if (error.response?.status === 500) {
        console.error(
          '[getArticlesByUserClient] Server 500 error - possible backend issue'
        );

        // Можна додати додаткову інформацію для дебагу
        const errorData = error.response?.data;
        if (errorData) {
          console.error('[getArticlesByUserClient] Server error response:', {
            error: errorData.error,
            message: errorData.message,
            details: errorData.details,
          });
        }
      }

      throw new Error(
        error.response?.data?.error ||
          `Request failed with status code ${error.response?.status}`
      );
    } else {
      console.error('[getArticlesByUserClient] Unknown error type:', {
        error,
        errorType: typeof error,
        isErrorInstance: error instanceof Error,
      });
      throw new Error('Unknown client error');
    }
  }
}

// export async function getUserByIdClient(
//   userId: string
// ): Promise<GetUserByIdResponse['data']> {
//   try {
//     const res = await api.get<GetUserByIdResponse>(`/users/${userId}`);
//     return res.data.data;
//   } catch (error: unknown) {
//     if (isAxiosError(error)) {
//       console.error('[getUserByIdClient error]', error.message);
//       throw new Error(error.response?.data?.error || 'Failed to fetch user');
//     } else {
//       console.error('[getUserByIdClient unknown error]', error);
//       throw new Error('Unknown server error');
//     }
//   }
// }

/*end Haievoi Serhii*/
export async function fetchStoryByIdClient(storyId: string): Promise<Story> {
  const response = await api.get<StoryByIdResponse>(`/stories/${storyId}`);
  return response.data.data;
}

export async function fetchSavedStoriesByUserId(
  userId: string
): Promise<SavedStory[]> {
  console.log('fetchSavedStoriesByUserId CALL with userId:', userId);

  const res = await api.get<UserSavedArticlesResponse>(
    `/users/${userId}/saved-articles`
  );

  console.log(
    'fetchSavedStoriesByUserId RESPONSE:',
    res.data.data.savedStories
  );

  return res.data.data.savedStories;
}

/**
 * Get current user profile with articles
 */
export async function getMeProfile(): Promise<{
  user: User;
  articles: Story[];
}> {
  const res = await api.get('/users/me/profile');
  const profileData = res.data.data;

  // Створюємо User об'єкт
  const user: User = {
    _id: profileData._id,
    name: profileData.name,
    avatarUrl: profileData.avatarUrl,
    articlesAmount: profileData.articlesAmount,
    createdAt: profileData.createdAt,
    updatedAt: profileData.updatedAt,
    description: profileData.description,
  };

  // Завантажуємо повну інформацію про кожну історію
  const articles = await Promise.allSettled(
    (profileData.articles || []).map(
      async (article: {
        _id: string;
        title: string;
        img: string;
        date: string;
        favoriteCount: number;
        createdAt: string;
        category: { _id: string; name: string };
      }) => {
        try {
          const fullStory = await fetchStoryByIdClient(article._id);
          return fullStory;
        } catch {
          // Fallback до базової інформації без article
          return {
            _id: article._id,
            img: article.img,
            title: article.title,
            article: '',
            category: article.category,
            ownerId: {
              _id: profileData._id,
              name: profileData.name,
              avatarUrl: profileData.avatarUrl || '',
              articlesAmount: profileData.articlesAmount,
              description: profileData.description ?? undefined,
            },
            date: article.date,
            favoriteCount: article.favoriteCount,
          } as Story;
        }
      }
    )
  );

  const stories = articles
    .map(result => (result.status === 'fulfilled' ? result.value : null))
    .filter((story): story is Story => story !== null);

  return { user, articles: stories };
}

/**
 * Get user saved articles
 */
export async function getUserSavedArticles(userId: string): Promise<{
  user: User;
  savedStories: Story[];
}> {
  const res = await api.get(`/users/${userId}/saved-articles`);
  const data = res.data.data;

  const user: User = {
    _id: data.user._id,
    name: data.user.name,
    avatarUrl: data.user.avatarUrl,
    articlesAmount: data.user.articlesAmount,
    createdAt: data.user.createdAt,
    description: data.user.description ?? undefined,
  };

  return {
    user,
    savedStories: data.savedStories || [],
  };
}

export async function fetchSavedStoriesMe(): Promise<SavedStory[]> {
  const res = await api.get<UserSavedArticlesResponse>(
    '/users/me/saved-articles'
  );
  return res.data.data.savedStories;
}

