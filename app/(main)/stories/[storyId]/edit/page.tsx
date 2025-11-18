'use client';

import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import css from './EditStoryPage.module.css';
import EditStoryForm from '@/components/EditStoryForm/EditStoryForm';

export default function AddStoryPage() {
  return (
    <ProtectedRoute>
      <div className="container">
        <h1 className={css.mainTitle}>Редагувати історію</h1>
        <EditStoryForm />
      </div>
    </ProtectedRoute>
  );
}
