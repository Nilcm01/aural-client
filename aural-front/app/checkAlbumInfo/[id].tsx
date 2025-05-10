// app/checkAlbumInfo/[id].tsx
import React, { useEffect } from 'react';
import AlbumInfo from '../components/checkAlbumInfo';
import ArtistInfo from '../components/checkArtistInfo';
import { useReproBarVisibility } from '../components/WebPlayback';
import { useFocusEffect } from 'expo-router';



export default function Page() {
    const { showReproBar } = useReproBarVisibility();
    useFocusEffect(() => {
        showReproBar(false);
        return () => { };
    });
    return (
        <AlbumInfo />
    );
}
