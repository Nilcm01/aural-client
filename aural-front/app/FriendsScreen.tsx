import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FriendItem from './components/FriendItem';
import AppBar from './components/appBar';

const FriendsScreen = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Para propósitos de prueba, usamos "Test1Friends". Cámbialo por el userId actual.
  const userId = 'Test1Friends';

  const fetchFriendsData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/items/friends?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error en la respuesta de la red');
      }
      const data = await response.json();
      setFriendRequests(data.friend_requests);
      setFriendsList(data.friends);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al obtener los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, [userId]);

  // Función para refrescar los datos, que se pasará a FriendItem
  const refreshFriendsData = () => {
    setLoading(true);
    fetchFriendsData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f05858" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        {friendRequests.map((friend, index) => (
          <FriendItem
            key={index}
            friend={friend}
            isRequest
            currentUserId={userId}
            onAction={refreshFriendsData}
          />
        ))}
        <Text style={styles.sectionTitle}>My Friends</Text>
        {friendsList.map((friend, index) => (
          <FriendItem key={index} friend={friend} currentUserId={userId} />
        ))}
      </ScrollView>
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
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FriendsScreen;
