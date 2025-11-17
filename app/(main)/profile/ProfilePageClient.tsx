'use client';

import { useState, useEffect, useRef } from 'react';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import ProfileTabs from '@/components/ProfileTabs/ProfileTabs';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import Loader from '@/components/Loader/Loader';
import { User } from '@/types/user';
import { Story } from '@/types/story';
import { getMeProfile, getUserSavedArticles } from '@/lib/api/clientApi';
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

  const savedStoriesLoadedRef = useRef(initialSavedStories !== null);
  const myStoriesLoadedRef = useRef(initialMyStories.length > 0);

  const currentUser = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const authIsLoading = useAuthStore(state => state.isLoading);

  // Завантаження даних при зміні табу
  useEffect(() => {
    const fetchData = async () => {
      if (authIsLoading) return;
      if (!isAuthenticated) {
        setError('Користувач не залогінений');
        setIsLoading(false);
        return;
      }

      // Якщо дані вже завантажені з SSR для поточного табу, використовуємо їх
      if (activeTab === 'my') {
        if (myStoriesLoadedRef.current && initialMyStories.length > 0) {
          setStories(initialMyStories);
          setIsLoading(false);
          return;
        }
        // Завантажуємо "Мої історії" тільки якщо не завантажені з SSR
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

      // Для табу "Збережені історії"
      if (activeTab === 'saved') {
        if (savedStoriesLoadedRef.current && initialSavedStories !== null) {
          setStories(initialSavedStories);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setError(null);
          let userId = currentUser?._id;
          if (!userId && user?._id) {
            userId = user._id;
          }
          if (!userId) {
            const { getMe } = await import('@/lib/api/clientApi');
            const me = await getMe(true);
            if (!me?._id) {
              throw new Error('Не вдалося отримати ID користувача');
            }
            userId = me._id;
          }
          const { user: profileUser, savedStories } =
            await getUserSavedArticles(userId);
          setUser(profileUser);
          setStories(savedStories || []);
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
  }, [activeTab, isAuthenticated, authIsLoading]);

  const handleTabChange = (tab: 'saved' | 'my') => {
    setActiveTab(tab);
  };

  const getMessageNoStoriesProps = (): {
    text: string;
    buttonText: string;
    redirectPath: '/stories/create' | '/stories';
  } => {
    if (activeTab === 'my') {
      return {
        text: 'Ви ще нічого не публікували, поділіться своєю першою історією!',
        buttonText: 'Опублікувати історію',
        redirectPath: '/stories/create',
      };
    } else {
      return {
        text: 'У вас ще немає збережених історій, мершій збережіть вашу першу історію!',
        buttonText: 'До історій',
        redirectPath: '/stories',
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
              </div>
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
                <TravellersStories
                  stories={stories}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
