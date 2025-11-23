'use client';

import { useState, useEffect, useRef } from 'react';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import ProfileTabs from '@/components/ProfileTabs/ProfileTabs';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import Loader from '@/components/Loader/Loader';
import EditProfileModal from '@/components/EditProfileModal/EditProfileModal';
import { User } from '@/types/user';
import { Story } from '@/types/story';
import {
  getMeProfile,
  getUserSavedArticles,
  deleteStoryByIdClient,
} from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import css from './ProfilePage.module.css';

type TabType = 'saved' | 'my';

interface ProfilePageClientProps {
  initialUser: User | null;
  initialMyStories: Story[];
  initialSavedStories: Story[] | null;
}

export default function ProfilePageClient({
  initialUser,
  initialMyStories,
  initialSavedStories,
}: ProfilePageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [user, setUser] = useState<User | null>(initialUser);
  const [stories, setStories] = useState<Story[]>(
    initialUser && initialMyStories.length > 0 ? initialMyStories : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const savedStoriesLoadedRef = useRef(initialSavedStories !== null);
  const myStoriesLoadedRef = useRef(initialMyStories.length > 0);

  // рефи для стабільних значень initial
  const initialMyStoriesRef = useRef(initialMyStories);
  const initialSavedStoriesRef = useRef(initialSavedStories);

  const currentUser = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const authIsLoading = useAuthStore(state => state.isLoading);

  // Видалення картки зі сторінки після "unfavorite"
  const handleRemoveSavedStory = (storyId: string) => {
    setStories(prev => prev.filter(story => story._id !== storyId));
  };
  const handleDeleteMyStory = async (storyId: string) => {
    console.log('🔄 handleDeleteMyStory called with storyId:', storyId);

    try {
      console.log('📤 Calling deleteStoryByIdClient API for story:', storyId);
      await deleteStoryByIdClient(storyId);
      console.log('✅ Successfully deleted story from DB:', storyId);

      console.log('🔄 Removing story from UI state:', storyId);
      setStories(prev => {
        const newStories = prev.filter(story => story._id !== storyId);
        console.log(
          '✅ UI state updated. Remaining stories:',
          newStories.length
        );
        return newStories;
      });

      toast.success('Історію успішно видалено');
    } catch (error) {
      console.error('❌ Error in handleDeleteMyStory:', {
        error,
        storyId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
      });
      toast.error('Не вдалося видалити історію');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (authIsLoading) return;
      if (!isAuthenticated) {
        setError('Користувач не залогінений');
        setIsLoading(false);
        return;
      }

      // --- Мої історії ---
      if (activeTab === 'my') {
        if (
          myStoriesLoadedRef.current &&
          initialMyStoriesRef.current.length > 0
        ) {
          setStories(initialMyStoriesRef.current);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setError(null);
          const { user: profileUser, articles } = await getMeProfile();
          setUser(profileUser);
          setStories(articles || []);
          myStoriesLoadedRef.current = true;
        } catch (error) {
          console.error('Failed to fetch my stories:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Не вдалося завантажити дані профілю';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // --- Збережені історії ---
      if (activeTab === 'saved') {
        if (
          savedStoriesLoadedRef.current &&
          initialSavedStoriesRef.current !== null
        ) {
          const savedStoriesWithFavorite = initialSavedStoriesRef.current.map(
            story => ({
              ...story,
              isFavorite: true,
            })
          );
          setStories(savedStoriesWithFavorite);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setError(null);
          let userId = currentUser?._id || user?._id;
          if (!userId) {
            const { getMe } = await import('@/lib/api/clientApi');
            const me = await getMe(true);
            if (!me?._id) throw new Error('Не вдалося отримати ID користувача');
            userId = me._id;
          }

          const { user: profileUser, savedStories } =
            await getUserSavedArticles(userId);
          setUser(profileUser);

          const savedStoriesWithFavorite = (savedStories || []).map(story => ({
            ...story,
            isFavorite: true,
          }));

          setStories(savedStoriesWithFavorite);
          savedStoriesLoadedRef.current = true;
        } catch (error) {
          console.error('Failed to fetch saved stories:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Не вдалося завантажити збережені історії';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab, isAuthenticated, authIsLoading, currentUser?._id, user?._id]);

  const handleTabChange = (tab: 'saved' | 'my') => setActiveTab(tab);

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    // Оновлюємо також в authStore, якщо це поточний користувач
    const { setUser: setAuthUser } = useAuthStore.getState();
    if (currentUser?._id === updatedUser._id) {
      setAuthUser(updatedUser);
    }
  };

  const getMessageNoStoriesProps = (): {
    text: string;
    buttonText: string;
    route: '/stories/create' | '/stories';
  } => {
    if (activeTab === 'my') {
      return {
        text: 'Ви ще нічого не публікували, поділіться своєю першою історією!',
        buttonText: 'Опублікувати історію',
        route: '/stories/create',
      };
    } else {
      return {
        text: 'У вас ще немає збережених історій, мершій збережіть вашу першу історію!',
        buttonText: 'До історій',
        route: '/stories',
      };
    }
  };

  if (authIsLoading || isLoading) {
    return (
      <div className="container">
        <div className={css.loaderWrapper}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <section className={css.profile}>
      <div className="container">
        {error ? (
          <div className={css.errorWrapper}>
            <p className={css.errorText}>{error}</p>
          </div>
        ) : (
          <>
            {user && (
              <div className={css.containerTraveller}>
                <div className={css.travellerInfoWrapper}>
                  <TravellerInfo
                    user={user}
                    useDefaultStyles={false}
                    priority
                    className={{
                      travellerInfoWraper: css.travellerInfoWraper,
                      image: css.image,
                      wrapper: css.wrapperContent,
                      container: css.travellerContainer,
                      name: css.travellerName,
                      text: css.travellerText,
                    }}
                    imageSize={{ width: 199, height: 199 }}
                  />
                  <button
                    className={css.editButton}
                    onClick={() => setIsEditModalOpen(true)}
                    type="button"
                    aria-label="Редагувати профіль"
                  >
                    Редагувати профіль
                  </button>
                </div>
              </div>
            )}
            {user && (
              <EditProfileModal
                user={user}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateProfile}
              />
            )}
            <div className={css.tabsWrapper}>
              <ProfileTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
            <div className={css.storiesWrapper}>
              {stories.length === 0 ? (
                <MessageNoStories {...getMessageNoStoriesProps()} />
              ) : (
                <>
                  {console.log('🔍 Rendering TravellersStories with props:', {
                    storiesCount: stories.length,
                    isAuthenticated,
                    hasOnRemoveSavedStory: !!handleRemoveSavedStory,
                    hasOnDeleteStory: !!handleDeleteMyStory,
                    activeTab,
                    isMyStory: activeTab === 'my',
                    variant:
                      activeTab === 'my' ? 'profileMyStories' : undefined,
                  })}
                  <TravellersStories
                    stories={stories}
                    isAuthenticated={isAuthenticated}
                    onRemoveSavedStory={handleRemoveSavedStory}
                    onDeleteStory={handleDeleteMyStory}
                    isMyStory={activeTab === 'my'}
                    variant={
                      activeTab === 'my' ? 'profileMyStories' : undefined
                    }
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
