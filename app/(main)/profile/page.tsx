'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import ProfileTabs from '@/components/ProfileTabs/ProfileTabs';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import Loader from '@/components/Loader/Loader';
import { User } from '@/types/user';
import { Story } from '@/types/story';
import { getMe, getMeProfile, getUserSavedArticles } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import css from './ProfilePage.module.css';

type TabType = 'saved' | 'my';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const authIsLoading = useAuthStore(state => state.isLoading);

  // Завантаження профілю та "Мої історії" при монтуванні
  useEffect(() => {
    const fetchData = async () => {
      if (authIsLoading) return;
      if (!isAuthenticated) {
        setError('Користувач не залогінений');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (activeTab === 'my') {
          const { user: profileUser, articles } = await getMeProfile();
          setUser(profileUser);
          setStories(articles || []);
        } else {
          let userId = currentUser?._id;
          if (!userId) {
            const me = await getMe();
            if (!me?._id) {
              throw new Error('Не вдалося отримати ID користувача');
            }
            userId = me._id;
          }
          const { user: profileUser, savedStories } =
            await getUserSavedArticles(userId);
          setUser(profileUser);
          setStories(savedStories || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити дані профілю';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab, currentUser?._id, isAuthenticated, authIsLoading]);

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
      <ProtectedRoute>
        <div className="container">
          <div className={css.loaderWrapper}>
            <Loader />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <section className={css.profile}>
        <div className="container">
          {error ? (
            <div className={css.errorWrapper}>
              <p className={css.errorText}>{error}</p>
            </div>
          ) : (
            <>
              {' '}
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
    </ProtectedRoute>
  );
}
