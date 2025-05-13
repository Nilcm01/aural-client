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
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useToken } from '../context/TokenContext';
import { useNavigation } from 'expo-router';
import Clipboard from '@react-native-clipboard/clipboard';
import { usePlayContent } from './WebPlayback';
import { useSharing } from '../context/SharingContext';

interface ArtistInfoProps {
  id: string;
  name: string;
  onBack: () => void;
}

interface ArtistDetail {
  images: { url: string }[];
  followers: { total: number };
  genres: string[];
  id: string;
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  album_type: string;
}

interface Track {
  id: string;
  name: string;
}

const ArtistInfo: React.FC<ArtistInfoProps> = ({ id, name, onBack }) => {
  const { token } = useToken();
  const navigation = useNavigation<any>();
  const { playContent } = usePlayContent();
  const { linkCreate } = useSharing();
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id || !token?.access_token) return;
    setLoading(true);
    (async () => {
      try {
        const [artRes, albRes, topRes, savRes] = await Promise.all([
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
          fetch(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${id}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
        ]);

        if (!artRes.ok || !albRes.ok || !topRes.ok || !savRes.ok) {
          throw new Error(`Spotify API error`);
        }

        const artData = await artRes.json();
        const albData = await albRes.json();
        const topData = await topRes.json();
        const savData = await savRes.json();

        setArtist(artData);
        setSaved(savData[0]);

        // Filtramos álbumes duplicados por nombre
        const uniqueAlbums = albData.items.filter(
          (a: Album, i: number, arr: Album[]) =>
            arr.findIndex(x => x.name === a.name) === i
        );
        // release_date format: yyyy-mm
        uniqueAlbums.sort((a: Album, b: Album) => {
          const dateA = new Date(a.release_date);
          const dateB = new Date(b.release_date);
          return dateB.getTime() - dateA.getTime();
        });
        setAlbums(uniqueAlbums.filter((a: Album) => a.album_type === 'album'));
        setSingles(uniqueAlbums.filter((a: Album) => a.album_type === 'single'));
        setTracks(topData.tracks);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar la información del artista.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const handleSaveAartist = async () => {
    if (!id || !token?.access_token) return;

    if (!saved) /* Not saved -> save */ {
      try {
        const resSave = await fetch(`https://api.spotify.com/v1/me/following?type=artist`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [id] }),
        });

        if (!resSave.ok) {
          throw new Error('Spotify API error: ' + `${resSave.status} ${resSave.statusText}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSaved(true);
        console.log('Artist saved to library');
      }
    } else /* Saved -> remove */ {
      try {
        const resDelete = await fetch(`https://api.spotify.com/v1/me/following?type=artist`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [id] }),
        });

        if (!resDelete.ok) {
          throw new Error('Spotify API error: ' + `${resDelete.status} ${resDelete.statusText}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSaved(false);
        console.log('Artist removed from library');
      }
    }
  };

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
    <TouchableOpacity style={styles.albumItem} onPress={() =>
      navigation.navigate("checkAlbumInfo/[id]", {
        id: item.id,
        name: item.name,
      })
    }>
      {item.images[0] && (
        <Image source={{ uri: item.images[0].url }} style={styles.albumImage} />
      )}
      <Text style={styles.albumName}>{item.name}</Text>
    </TouchableOpacity>
  );
  const renderTrack = ({ item }: { item: Track }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => playContent(token?.access_token, 'track', item.id, 0)}>
      <Text style={styles.trackText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Artist Info */}
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

      <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center', alignItems: 'center', gap: 80 }}>
        <TouchableOpacity onPress={() => { handleSaveAartist(); }}>
          <MaterialIcons name={
            saved ? 'check-circle' : 'add-circle-outline'
          } size={32} color="#f05858" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Clipboard.setString(linkCreate('artist', artist.id));
        }}>
          <MaterialIcons name="share" size={24} color="#f05858" />
        </TouchableOpacity>
      </View>

      {/* Top Tracks Box */}
      <View style={styles.box}>

        <View style={styles.titleWrapper}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          <TouchableOpacity onPress={() => playContent(token?.access_token, 'artist', artist.id, 0)}>
            <MaterialIcons name="play-circle-outline" size={42} color="#f05858" />
          </TouchableOpacity>
        </View>

        <FlatList data={tracks} keyExtractor={i => i.id} renderItem={renderTrack} />
      </View>

      {/* Albums Box */}
      <View style={styles.box}>
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

      {/* Singles Box */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Singles</Text>
        <FlatList
          data={singles}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          renderItem={renderAlbum}
          contentContainerStyle={styles.albumList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 10, zIndex: 50 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },
  backButton: { position: 'absolute', top: 10, left: 10, zIndex: 1 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
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
  section: { paddingHorizontal: 20 },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f05858', marginBottom: 10 },
  box: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    borderColor: '#f05858',
    borderWidth: 0.5,
  },
  albumList: { paddingBottom: 10 },
  albumItem: { marginRight: 15, alignItems: 'center' },
  albumImage: { width: 120, height: 120, borderRadius: 8 },
  albumName: { color: '#fff', width: 120, textAlign: 'center', marginTop: 5 },
  trackItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  trackText: { color: '#fff' },
});

export default ArtistInfo;
