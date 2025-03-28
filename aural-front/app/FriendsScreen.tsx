// FriendsScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import FriendItem from './components/FriendItem';
// import FooterBar from '../components/footerBar'; // Ajusta la ruta según corresponda
import AppBar from './components/appBar';

const FriendsScreen = () => {
  // TODO: Integrate with backend to fetch friend requests and friends list from database.
  // Reemplazar los datos mock con datos reales.
  const friendRequests = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  const friendsList = [
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'David' },
    { id: '5', name: 'Eve' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        {friendRequests.map(friend => (
          <FriendItem key={friend.id} friend={friend} isRequest />
        ))}
        <Text style={styles.sectionTitle}>My Friends</Text>
        {friendsList.map(friend => (
          <FriendItem key={friend.id} friend={friend} />
        ))}
      </ScrollView>
      {/* <FooterBar /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141218',
    padding: 20,
  },
  content: {
    paddingBottom: 100, // Deja espacio para el FooterBar
  },
  sectionTitle: {
    fontSize: 24, // Títulos más grandes
    color: '#f05858',
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
  },
});

export default FriendsScreen;
