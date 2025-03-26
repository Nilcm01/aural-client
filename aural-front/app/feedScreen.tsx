// app/(feedScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface Publication {
  id: string;
  text: string;
}

const initialPublications: Publication[] = [
  { id: '1', text: 'First publication' },
  { id: '2', text: 'Second publication' },
  { id: '3', text: 'Third publication' },
];

const FeedScreen: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>(initialPublications);

  const handleReload = () => {
    // TODO: Integrate with the backend to reload publications
    Alert.alert('Reload', 'Feed reloaded (simulated)');
    console.log("Reloading publications (simulated)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Publications Feed</Text>
      <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
        <Text style={styles.reloadButtonText}>Reload Feed</Text>
      </TouchableOpacity>
      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.publicationItem}>
            <Text style={styles.publicationText}>{item.text}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  publicationItem: {
    backgroundColor: '#262626',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  publicationText: {
    fontSize: 16,
    color: 'white',
  },
});

export default FeedScreen;
