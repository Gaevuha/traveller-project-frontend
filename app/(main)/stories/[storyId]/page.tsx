'use client';

import { useParams } from 'next/navigation';

export default function StoryPage() {
  const params = useParams();
  return <h2>StoryId – {params.storyId}</h2>;
}
