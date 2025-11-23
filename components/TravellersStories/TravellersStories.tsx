import { Story } from '@/types/story';
import TravellersStoriesItem from '../TravellersStoriesItem/TravellersStoriesItem';
import css from './TravellersStories.module.css';

interface TravellersStoriesProps {
  stories: Story[];
  isAuthenticated: boolean;
  className?: string; // додатковий проп для кастомного стилю
  onRemoveSavedStory?: (id: string) => void; // ⬅ додаємо!
  onDeleteStory?: (id: string) => void;
  isMyStory?: boolean;
  variant?: 'profileMyStories';
}

export default function TravellersStories({
  stories,
  isAuthenticated,
  className,
  isMyStory,
  onDeleteStory,
  onRemoveSavedStory,
  variant,
}: TravellersStoriesProps) {
  return (
    <ul className={`${css.stories__list} ${className || ''}`}>
      {stories.map(story => (
        <TravellersStoriesItem
          key={story._id}
          story={story}
          isAuthenticated={isAuthenticated}
          onRemoveSavedStory={onRemoveSavedStory}
          onDeleteStory={onDeleteStory}
          isMyStory={isMyStory}
          variant={variant}
        />
      ))}
    </ul>
  );
}
