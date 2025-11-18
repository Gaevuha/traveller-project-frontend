'use client';

import EditStoryForm from '@/components/EditStoryForm/EditStoryForm';
// import css from './EditStoryPage.module.css';
import { useParams } from 'next/navigation';

export default function EditStoryFormClient() {
  const { id } = useParams<{ id: string }>();
  return <EditStoryForm id={id} />;
}
