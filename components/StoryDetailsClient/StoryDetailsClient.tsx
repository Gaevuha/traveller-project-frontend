"use client";


import { useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { fetchSavedStoriesByUserId } from "@/lib/api/clientApi";
import { useQuery } from "@tanstack/react-query";


export const StoryDetailsClient = () => {
    const { storyId } = useParams<{ storyId: string }>();


  const storeUser = useAuthStore((state) => state.user);
  // const userId = storeUser?.id ?? null;





  // // 2) локальний стейт для userId
  // const [userId, setUserId] = useState<string | null>(
  //   storeUser?._id ?? null
  // );

  // // 3) если userId нет в сторе — пробуем достать из localStorage (auth-storage)
  // useEffect(() => {
  //   if (storeUser?._id) {
  //     setUserId(storeUser._id);
  //     return;
  //   }

  //   if (typeof window === "undefined") return;

  //   try {
  //     const raw = localStorage.getItem("auth-storage");
  //     if (!raw) return;

  //     const parsed = JSON.parse(raw);
  //     const persistedUser = parsed?.state?.user;

  //     if (persistedUser?._id) {
  //       setUserId(persistedUser._id);
  //     }
  //   } catch (e) {
  //     console.error("Failed to read auth-storage:", e);
  //   }
  // }, [storeUser?._id]);

  // // 4) тянем сохранённые истории (только если есть userId)
  // const { data: savedStories = [] } = useQuery({
  //   queryKey: ["savedStoriesByUser", userId],
  //   queryFn: () => fetchSavedStoriesByUserId(userId as string),
  //   enabled: !!userId, // запрос только если userId уже известен
  // });

  // // 5) тянем саму історію
  // const {
  //   data: story,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["story", storyId],
  //   queryFn: () => fetchStoryByIdClient(storyId),
  //   refetchOnMount: false,
  // });

  // if (isLoading) return <Loader />;
  // if (error || !story) return <ErrorMessage />;

  // // для дебага — можешь оставить пока
  // console.log("current storyId:", story._id);
  // console.log("savedStories ids:", savedStories.map((s) => s._id));

  // // 6) есть ли эта история среди збережених
  // const initiallySaved = savedStories.some(
  //   (savedStory) => savedStory._id === story._id
  // );

  return (
    <>
      {/* <div>
        <p>HISTORY</p>
        <h1>{story.title}</h1>
        <Image
          className="story-card-image"
          src={story.img}
          alt={story.title}
          width={416}
          height={277.11}
        />
        <h2>{story.ownerId.name}</h2>
      </div>

      <SaveStoryButton storyId={story._id} initiallySaved={initiallySaved} /> */}
    </>
  );
};
