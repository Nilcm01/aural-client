import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const AlbumInfo = () => {
  const route = useRoute();
  const { album } = route.params;  // Get album info from navigation params

  const [loading, setLoading] = useState(true);
  //const [tracks, setTracks] = useState<any[]>([]);

  // Función para obtener las pistas del álbum
  useEffect(() => {
    const fetchAlbumTracks = async () => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`);
        const data = await response.json();
        setTracks(data.items);
      } catch (error) {
        console.error("Error fetching album tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumTracks();
  }, [album.id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#f05858" />;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: album.images[0].url }} style={styles.albumImage} />
      <Text style={styles.albumName}>{album.name}</Text>
      <Text style={styles.albumArtist}>{album.artists.map(artist => artist.name).join(", ")}</Text>

      <Text style={styles.tracksTitle}>Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Text style={styles.trackName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    padding: 20,
  },
  albumImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  albumName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  albumArtist: {
    fontSize: 18,
    color: '#f05858',
    marginBottom: 20,
  },
  tracksTitle: {
    fontSize: 18,
    color: '#f05858',
    marginTop: 20,
    marginBottom: 10,
  },
  trackItem: {
    marginBottom: 10,
  },
  trackName: {
    color: 'white',
    fontSize: 16,
  },
});

export default AlbumInfo;
