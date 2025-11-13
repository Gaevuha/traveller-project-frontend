'use client';

import { useParams } from 'next/navigation';

export default function TravelerPage() {
  const params = useParams();
  return <h2>TravelerId – {params.travellerId}</h2>;
}
