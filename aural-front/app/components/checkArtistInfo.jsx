import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ArtistInfo = () => {
  const route = useRoute();
  const { artist } = route.params;  // Get artist info from navigation params

  const [loading, setLoading] = useState(false);
  //const [albums, setAlbums] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/albums`);
        const data = await response.json();
        setAlbums(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [artist.id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#f05858" />;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: artist.images[0].url }} style={styles.artistImage} />
      <Text style={styles.artistName}>{artist.name}</Text>
      
      <Text style={styles.albumsTitle}>Albums</Text>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.albumItem}>
            <Image source={{ uri: item.images[0]?.url }} style={styles.albumImage} />
            <Text style={styles.albumName}>{item.name}</Text>
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
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  artistName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  albumsTitle: {
    fontSize: 18,
    color: '#f05858',
    marginTop: 20,
    marginBottom: 10,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  albumName: {
    fontSize: 16,
    color: 'white',
  },
});

export default ArtistInfo;
