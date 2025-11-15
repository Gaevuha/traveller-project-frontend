import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStoryToFavorites } from "../api/clientApi";


export const useSaveStory = (storyId: string) => {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: () => addStoryToFavorites(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      queryClient.invalidateQueries({ queryKey: ["savedStories"] });
    },
  });
};