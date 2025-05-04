// app/checkArtistInfo/[id].tsx
import React, { useEffect } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import ArtistInfo from '../components/checkArtistInfo';
import { useReproBarVisibility } from '../components/WebPlayback';

export default function Page() {
  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
      showReproBar(false);
      return () => {};
    });
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  return (
    <ArtistInfo
      id={id!}
      name={name!}
      onBack={() => { if (router.canGoBack()) { router.back(); } else { router.push('/'); } }} />
  );
}
