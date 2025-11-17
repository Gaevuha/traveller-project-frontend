import { Story } from '@/types/story';
import TravellersStoriesItem from '../TravellersStoriesItem/TravellersStoriesItem';
import css from './TravellersStories.module.css';

interface TravellersStoriesProps {
  stories: Story[];
  isAuthenticated: boolean;
  onRemoveSavedStory?: (id: string) => void; // ⬅ додаємо!

  // className?: string; // додатковий проп для кастомного стилю
}

export default function TravellersStories({
  stories,
  isAuthenticated,
  onRemoveSavedStory,
  // className,
}: TravellersStoriesProps) {
  return (
    <ul className={css.stories__list}>
      {stories.map(story => (
        <TravellersStoriesItem
          key={story._id}
          story={story}
          isAuthenticated={isAuthenticated}
          onRemoveSavedStory={onRemoveSavedStory}
        />
      ))}
    </ul>
  );
}
