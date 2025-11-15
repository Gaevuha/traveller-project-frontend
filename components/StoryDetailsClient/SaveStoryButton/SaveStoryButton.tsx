"use client";

import { useSaveStory } from "@/lib/hooks/useSaveStory";

type SaveStoryButtonProps = {
  storyId: string;
};

export const SaveStoryButton = ({ storyId }: SaveStoryButtonProps) => {
  const { mutate, isPending } = useSaveStory(storyId);

  const handleClick = () => {
    mutate();
  };

  return (
    <button type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Зберігаю..." : "Зберегти"}
    </button>
  );
};