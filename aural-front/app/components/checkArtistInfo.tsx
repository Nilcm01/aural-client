// components/ArtistInfo.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToken } from '../context/TokenContext';

interface ArtistInfoProps {
  id: string;
  name: string;
  onBack: () => void;
}

interface ArtistDetail {
  images: { url: string }[];
  followers: { total: number };
  genres: string[];
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
}

interface Track {
  id: string;
  name: string;
}

const ArtistInfo: React.FC<ArtistInfoProps> = ({ id, name, onBack }) => {
  const { token } = useToken();
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !token?.access_token) return;
    setLoading(true);
    (async () => {
      try {
        const [artRes, albRes, topRes] = await Promise.all([
          fetch(`https://api.spotify.com/v1/artists/${id}`, {
            headers: { Authorization: `Bearer ${token.access_token}` },
          }),
          fetch(
            `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`,
            { headers: { Authorization: `Bearer ${token.access_token}` } }
          ),
          fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=ES`, {
            headers: { Authorization: `Bearer ${token.access_token}` },
          }),
        ]);

        if (!artRes.ok || !albRes.ok || !topRes.ok) {
          throw new Error('Spotify API error');
        }

        const artData = await artRes.json();
        const albData = await albRes.json();
        const topData = await topRes.json();

        setArtist(artData);

        // Filtramos álbumes duplicados por nombre
        const uniqueAlbums = albData.items.filter(
          (a: Album, i: number, arr: Album[]) =>
            arr.findIndex(x => x.name === a.name) === i
        );
        setAlbums(uniqueAlbums);
        setTracks(topData.tracks);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar la información del artista.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f05858" />
      </View>
    );
  }
  if (!artist) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.error}>Artista no encontrado.</Text>
      </View>
    );
  }

  const renderAlbum = ({ item }: { item: Album }) => (
    <View style={styles.albumItem}>
      {item.images[0] && (
        <Image source={{ uri: item.images[0].url }} style={styles.albumImage} />
      )}
      <Text style={styles.albumName}>{item.name}</Text>
    </View>
  );
  const renderTrack = ({ item }: { item: Track }) => (
    <View style={styles.trackItem}>
      <Text style={styles.trackText}>{item.name}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        {artist.images[0] && (
          <Image source={{ uri: artist.images[0].url }} style={styles.artistImage} />
        )}
        <Text style={styles.artistName}>{name}</Text>
        <Text style={styles.followers}>
          {artist.followers.total.toLocaleString()} Followers
        </Text>
        {artist.genres.length > 0 && (
          <Text style={styles.genres}>{artist.genres.join(', ')}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Albums</Text>
        <FlatList
          data={albums}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          renderItem={renderAlbum}
          contentContainerStyle={styles.albumList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Tracks</Text>
        <FlatList data={tracks} keyExtractor={i => i.id} renderItem={renderTrack} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 20 },
  artistImage: { width: 160, height: 160, borderRadius: 80 },
  artistName: { fontSize: 32, fontWeight: 'bold', color: '#f05858', marginTop: 15 },
  followers: { color: '#bbb', marginTop: 5 },
  genres: {
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f05858', marginBottom: 10 },
  albumList: { paddingBottom: 10 },
  albumItem: { marginRight: 15, alignItems: 'center' },
  albumImage: { width: 120, height: 120, borderRadius: 8 },
  albumName: { color: '#fff', width: 120, textAlign: 'center', marginTop: 5 },
  trackItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  trackText: { color: '#fff' },
});

export default ArtistInfo;
