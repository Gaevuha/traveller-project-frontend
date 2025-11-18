// app/(main)/stories/[storyId]/edit/page.tsx

import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import css from './EditStoryPage.module.css';
// import EditStoryFormClient from './EditStoryForm.client';
import EditStoryForm from '@/components/EditStoryForm/EditStoryForm';
import { fetchStoryByIdServer } from '@/lib/api/serverApi';

type Props = {
  params: Promise<{ storyId: string }>;
};

export default async function AddStoryPage({ params }: Props) {
  const { storyId } = await params;
  const story = await fetchStoryByIdServer(storyId);
  return (
    <ProtectedRoute>
      <div className={`container ${css.addStoryPageContainer}`}>
        <h1 className={css.mainTitle}>Редагування історії</h1>
        <EditStoryForm id={storyId} />
        {/* <EditStoryFormClient /> */}
      </div>
    </ProtectedRoute>
  );
}
