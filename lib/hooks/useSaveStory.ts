'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addStoryToFavorites } from '../api/clientApi';
import type { ApiError } from '../api/clientApi';

type UseSaveStoryOptions = {
  onUnauthorized?: () => void;
};

export const useSaveStory = (storyId: string, options?: UseSaveStoryOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => addStoryToFavorites(storyId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      queryClient.invalidateQueries({ queryKey: ['savedStoriesMe'] });
    },

    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        options?.onUnauthorized?.();
      }
    },
  });
};
