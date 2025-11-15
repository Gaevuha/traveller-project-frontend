'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addStoryToFavorites } from '../api/clientApi';
import type { ApiError } from '../api/clientApi';

export const useSaveStory = (storyId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => addStoryToFavorites(storyId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      queryClient.invalidateQueries({ queryKey: ["savedStoriesMe"] });
    },

    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    },
  });
};
