"use client";

import { useState, useEffect } from "react";
import { useSaveStory } from "@/lib/hooks/useSaveStory";

type SaveStoryButtonProps = {
  storyId: string;
  initiallySaved: boolean;
};

export const SaveStoryButton = ({
  storyId,
  initiallySaved,
}: SaveStoryButtonProps) => {
  const { mutate, isPending } = useSaveStory(storyId);
  const [isSaved, setIsSaved] = useState(initiallySaved);


  useEffect(() => {
    setIsSaved(initiallySaved);
  }, [initiallySaved]);

  const handleClick = () => {
    if (isSaved || isPending) return;

    mutate(undefined, {
      onSuccess: () => {
        setIsSaved(true);
      },
    });
  };

  const label = isPending
    ? "Зберігаю..."
    : isSaved
    ? "Історія збережена"
    : "Зберегти";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || isSaved}
    >
      {label}
    </button>
  );
};
