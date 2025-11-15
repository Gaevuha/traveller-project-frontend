import { cookies } from 'next/headers';
import { api } from '@/app/api/api';
 import{ User,
  GetUsersResponse,
  GetUserByIdResponse,
  GetStoriesResponse,
} from '@/types/user';
import { isAxiosError } from 'axios';

import { FetchStoriesOptions, StoriesResponse, Story, StoryByIdResponse } from '@/types/story';


/**
 * Refresh session tokens (server-side)
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
export const getServerMe = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Якщо немає жодного токена, не робити запит
    if (!accessToken && !refreshToken) {
      return null;
    }

    const { data } = await api.get<User>('/users/me/profile', {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    return data;
  } catch {
    return null;
  }
};

export async function getUsersServer(
  page = 1,
  perPage = 4
): Promise<GetUsersResponse> {
  try {
    const res = await api.get<GetUsersResponse>('/users', {
      params: { page, perPage },
    });
    return res.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('[getUsersServer error]', error.message);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch users from server'
      );
    } else {
      console.error('[getUsersServer unknown error]', error);
      throw new Error('Unknown server error');
    }
  }
}

export async function getUserByIdServer(
  userId: string
): Promise<GetUserByIdResponse> {
  try {
    const res = await api.get<GetUserByIdResponse>(`/users/${userId}`);
    return res.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('[getUsersServer error]', error.message);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch users from server'
      );
    } else {
      console.error('[getUsersServer unknown error]', error);
      throw new Error('Unknown server error');
    }
  }
}

export async function getStoriesServer(
  page: number = 1,
  perPage: number = 10
): Promise<{ data: GetStoriesResponse }> {
  const res = await api.get(`/stories`, {
    params: { page, perPage },
  });
  return res.data;
}


export const fetchStoryByIdServer = async (storyId: string): Promise<Story> => {
  const res = await api.get<StoryByIdResponse>(`/stories/${storyId}`);
  return res.data.data;
};
//function of Sergii Sotnikov
export const fetchStoriesServerDup = async ({
  page,
  perPage,
  excludeId,
}: FetchStoriesOptions): Promise<StoriesResponse> => {
  const res = await api.get<StoriesResponse>('/stories', {
    params: { page, perPage, excludeId },
  });
  return res.data;
};


export async function fetchStoriesServer(
  page: number = 1,
  perPage: number = 10,
  excludeId?: string,
): Promise<Story[]> {
  const response = await api.get<StoriesResponse>(`/stories`, {
    params: { page, perPage, sort: 'favoriteCount', excludeId },
  });
  
  return response.data?.data || [];
}

export const fetchSavedStoriesMeServer = async () => {
  const cookieHeader = (await cookies()).toString();

  const res = await api.get("/users/me/saved", {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return res.data.data.savedStories;
};

