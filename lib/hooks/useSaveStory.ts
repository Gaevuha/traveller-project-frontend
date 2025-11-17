'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addStoryToFavorites, type ApiError } from '@/lib/api/clientApi';
import type { SavedStory } from '@/types/story';

type UseSaveStoryOptions = {
  onUnauthorized?: () => void;
};


type SaveStoryContext = {
  previousSavedByUser?: SavedStory[]; 
};

export const useSaveStory = (
  storyId: string,
  options?: UseSaveStoryOptions,
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, ApiError, void, SaveStoryContext>({
    mutationFn: () => addStoryToFavorites(storyId),

    // 🔹 Оптимістичне оновлення cached savedStoriesByUser (Popular)
    onMutate: async (): Promise<SaveStoryContext> => {
      // 1) Скасувати активні запити, щоб не було гонок
      await queryClient.cancelQueries({ queryKey: ['savedStoriesByUser'] });

      // 2) Зберегти попередній кеш для можливого відкату
      const previousSavedByUser =
        queryClient.getQueryData<SavedStory[]>(['savedStoriesByUser']);

      // 3) Миттєво оновити кеш Popular
      queryClient.setQueryData<SavedStory[] | undefined>(
        ['savedStoriesByUser'],
        (current) => {
          if (!current) {
            // якщо кеша ще не було — нічого не чіпаємо (після refetch все підтягнеться)
            return current;
          }

          const alreadySaved = current.some(
            (saved) => saved._id === storyId,
          );

          if (alreadySaved) {
            return current;
          }

          // додаємо "пусту" saved-story: в Popular важливий тільки _id
          const newSaved: SavedStory = {
            ...current[0],
            _id: storyId,
          };

          return [...current, newSaved];
        },
      );

      return { previousSavedByUser };
    },

    // 🔹 Якщо помилка — відкатити кеш і обробити 401
    onError: (
      error: ApiError,
      _variables: void,
      context?: SaveStoryContext,
    ) => {
      // відкат кешу Popular, якщо щось поламалося
      if (context?.previousSavedByUser) {
        queryClient.setQueryData<SavedStory[]>(
          ['savedStoriesByUser'],
          context.previousSavedByUser,
        );
      }

      if (error.response?.status === 401) {
        if (options?.onUnauthorized) {
          options.onUnauthorized();
        } else {
          router.push('/auth/login');
        }
      } else {
        console.error(error);
      }
    },

    // 🔹 Після успіху — просто інваліднем усе, щоб підтягти свіжі дані з бекенда
    onSuccess: () => {
      // сама історія (детальна сторінка)
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });

      // збережені історії на сторінці деталки (StoryDetailsClient)
      queryClient.invalidateQueries({ queryKey: ['savedStoriesMe'] });

      // збережені історії в Popular (про всяк випадок, щоб звірити з беком)
      queryClient.invalidateQueries({ queryKey: ['savedStoriesByUser'] });
    },
  });
};
