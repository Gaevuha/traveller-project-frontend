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

export const metadata: Metadata = {
  title: 'Мій профіль | Подорожники',
  description: 'Перегляньте свої історії та збережені статті',
};

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
