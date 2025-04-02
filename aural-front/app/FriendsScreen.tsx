import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FriendItem from './components/FriendItem';
import AppBar from './components/appBar';
import { useToken } from './context/TokenContext';

const FriendsScreen: React.FC = () => {
  const { token } = useToken();
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Obtenim el user_id del token
  const userId = token?.user_id || '';

  const fetchFriendsData = async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(`http://localhost:5000/api/items/friends?userId=${userId}`);
      if (!response.ok) throw new Error('Error en la respuesta de la red');
      const data = await response.json();

      setFriendRequests(data.friend_requests || []);
      setFriendsList(
        data.friends 
          ? (Array.isArray(data.friends) ? data.friends : Object.keys(data.friends))
          : []
      );
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al obtener los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchFriendsData();
  }, [userId]);

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
    marginTop: 80
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
