import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

const AlbumInfo = () => {
  
  const route = useRoute();
  // const { name, album, artists, year, songs } = route.params;
  const { name } = route.params;  // Da error pero esta bien, NO MODIFICAR!!

  // Example data
  const album = {
    images: [{ }]
  };
  const artists = [{ name: 'Post Malone' }];
  const year = '2019';
  const songs = [
    { name: 'Sunflower' },
    { name: 'Wow.' },
    { name: 'Circles' },
    { name: 'Goodbyes' },
  ];

  const renderSongItem = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={styles.songText}>{item.name}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Artist Info */}
      <View style={styles.albumInfoBox}>
        <View style={styles.albumInfoLeft}>
          {/* Album Image */}
          {album?.images && album.images.length > 0 ? (
            <Image style={styles.albumImage} source={{ uri: album.images[0].url }} />
          ) : (
            <Text style={styles.noImageText}>No image available</Text>
          )}
        </View>
        <View style={styles.albumInfoRight}>
          <Text style={styles.albumName}>{name}</Text>
          <Text style={styles.artistText}>Artist: {artists.map(artist => artist.name).join(', ')}</Text>
          <Text style={styles.yearText}>Year: {year}</Text>
        </View>
      </View>

      {/* Songs list */}
      <View style={styles.songsBox}>
        <FlatList
          data={songs}
          renderItem={renderSongItem}
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
  albumInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    padding:20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  albumInfoLeft: {
    marginRight: 20,
    marginLeft: 75,
  },
  albumImage: {
    width: 175,
    height: 175,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  albumInfoRight: {
    flex: 1,
    marginLeft: 20,
  },
  albumName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f05858',
    marginBottom: 5,
  },
  artistText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  yearText: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 15,
  },
  noImageText: {
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 20,
  },
  songsBox: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#f05858',
  },
  songItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  songText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default AlbumInfo;
