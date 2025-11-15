"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { fetchStoryByIdClient } from "@/lib/api/clientApi";
// import { SaveStoryButton } from "../SaveStoryButton/SaveStoryButton";

export const StoryDetailsClient = () => {
  const { storyId } = useParams<{ storyId: string }>();

  const {
    data: story,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => fetchStoryByIdClient(storyId),
    enabled: !!storyId,    
    refetchOnMount: false,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !story) {
    return <ErrorMessage />;
  }

  return (
    <>
      <div>
        <p>HISTORY</p>
        <h1>{story.article}</h1>
        <Image
          className="story-card-image"
          src={story.img}
          alt={story.title}
          width={416}
          height={277.11}
        />
        <h2>{story.ownerId.name}</h2>
      </div>
      {/* <SaveStoryButton storyId={story._id} /> */}
    </>
  );
};