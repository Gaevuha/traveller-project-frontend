import { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import ProfilePageClient from './ProfilePageClient';
import {
  getMeProfileServer,
  getUserSavedArticlesServer,
  getServerMe,
} from '@/lib/api/serverApi';
import { User } from '@/types/user';
import { Story } from '@/types/story';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const currentUser = await getServerMe();
    if (currentUser) {
      const profileData = await getMeProfileServer();
      if (profileData) {
        const userName = profileData.user.name;
        const userDescription = profileData.user.description;
        const articlesCount = profileData.articles.length;

        return {
          title: `${userName} | Мій профіль | Подорожники`,
          description: userDescription
            ? `${userDescription} | Перегляньте ${articlesCount} історій користувача ${userName}`
            : `Профіль користувача ${userName} | Перегляньте ${articlesCount} історій мандрівника`,
          openGraph: {
            title: `${userName} | Подорожники`,
            description: userDescription || `Профіль користувача ${userName}`,
            url: `https://travel-fs116-teamproject-frontend-rouge.vercel.app/profile`,
            siteName: `Подорожники: ${userName}`,
            type: 'profile',
            ...(profileData.user.avatarUrl && {
              images: [
                {
                  url: profileData.user.avatarUrl,
                  width: 400,
                  height: 400,
                  alt: userName,
                },
              ],
            }),
          },
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata for profile page:', error);
  }

  // Fallback metadata
  return {
    title: 'Мій профіль | Подорожники',
    description: 'Перегляньте свої історії та збережені статті',
  };
}

export default async function ProfilePage() {
  let currentUser: User | null = null;
  let profileData: Awaited<ReturnType<typeof getMeProfileServer>> = null;
  let initialSavedStories: Story[] | null = null;

  try {
    currentUser = await getServerMe();
    if (currentUser) {
      profileData = await getMeProfileServer();

      if (profileData) {
        try {
          const savedArticlesData = await getUserSavedArticlesServer(
            currentUser._id
          );
          initialSavedStories = savedArticlesData?.savedStories || null;
        } catch {
          initialSavedStories = null;
        }

        const userData: User = profileData.user;
        const myStories = profileData.articles;

        return (
          <ProtectedRoute>
            <ProfilePageClient
              initialUser={userData}
              initialMyStories={myStories}
              initialSavedStories={initialSavedStories}
            />
          </ProtectedRoute>
        );
      }
    }
  } catch (error) {
    console.error('Error loading profile on server:', error);
  }

  return (
    <ProtectedRoute>
      <ProfilePageClient
        initialUser={null}
        initialMyStories={[]}
        initialSavedStories={null}
      />
    </ProtectedRoute>
  );
}
