import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

const ArtistInfo = () => {
  const route = useRoute();
  const { name } = route.params; // Da error pero esta bien, NO MODIFICAR!!

  // Datos de ejemplo
  const artist = {
    image: 'https://link_to_artist_image.jpg', // URL de la imagen del artista
    followers: 7800000,
    albums: [
      { name: 'Ultimate Workout', image: 'https://link_to_album_image1.jpg' },
      { name: 'Hitmaker', image: 'https://link_to_album_image2.jpg' },
      { name: 'Revolution', image: 'https://link_to_album_image3.jpg' },
      { name: 'Party Hits', image: 'https://link_to_album_image4.jpg' },
      { name: 'Summer Vibes', image: 'https://link_to_album_image5.jpg' },
    ],
    topTracks: [
      { name: '2 On (feat. ScHoolboy Q)' },
      { name: 'All My Friends (feat. Tinashe)' },
      { name: 'Wild Thoughts (feat. Rihanna)' },
      { name: 'Go! (feat. Migos)' },
      { name: 'Lover (feat. Drake)' },
    ],
  };

  const renderTrackItem = ({ item }) => (
    <View style={styles.trackItem}>
      <Text style={styles.trackText}>{item.name}</Text>
    </View>
  );

  const renderAlbumItem = ({ item }) => (
    <View style={styles.albumItem}>
      <Image source={{ uri: item.image }} style={styles.albumImage} />
      <Text style={styles.albumName}>{item.name}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Artist image and name */}
      <View style={styles.artistInfoBox}>
        <Image style={styles.artistImageLarge} source={{ uri: artist.image }} />
        <Text style={styles.artistName}>{name}</Text>
        <Text style={styles.followersText}>{artist.followers.toLocaleString()} Followers</Text>
      </View>

      {/* Top Albums */}
      <View style={styles.albumsBox}>
        <Text style={styles.sectionTitle}>Albums</Text>
        <FlatList
          data={artist.albums}
          renderItem={renderAlbumItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.albumListContainer}
        />
      </View>

      {/* Popular songs */}
      <View style={styles.popularTracksBox}>
        <Text style={styles.sectionTitle}>Top Tracks</Text>
        <FlatList
          data={artist.topTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  artistInfoBox: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  artistImageLarge: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20,
  },
  artistName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f05858',
    marginBottom: 5,
  },
  followersText: {
    fontSize: 16,
    color: '#bbb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f05858',
    marginBottom: 10,
  },
  albumsBox: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#f05858',
  },
  albumItem: {
    alignItems: 'center',
    marginRight: 150,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  albumName: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  albumListContainer: {
    paddingHorizontal: 50,
  },
  popularTracksBox: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#f05858',
  },
  trackItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  trackText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default ArtistInfo;
