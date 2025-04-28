// app/checkArtistInfo/[id].tsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ArtistInfo from '../components/checkArtistInfo';

export default function Page() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  return (
    <ArtistInfo
      id={id!}
      name={name!}
      onBack={() => router.back()}
    />
  );
}
