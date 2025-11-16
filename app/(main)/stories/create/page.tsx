
'use client';

import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import css from './AddStoryPage.module.css';
import AddStoryForm from '@/components/AddStoryForm/AddStoryForm';



export default function AddStoryPage() {
  return (
    <ProtectedRoute>
      <div className="container">
        <h1 className={css.mainTitle}>Створити нову історію</h1>
        <AddStoryForm />
      </div>

    </ProtectedRoute>
  );
}
