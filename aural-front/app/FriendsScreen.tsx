import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, ActivityIndicator, View, Pressable } from 'react-native';
import FriendItem from './components/FriendItem';
import AppBar from './components/appBar';
import { useToken } from './context/TokenContext';
import { useReproBarVisibility } from './components/WebPlayback';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

const FriendsScreen: React.FC = () => {
  const { token } = useToken();
  const { showReproBar } = useReproBarVisibility();
  showReproBar(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Obtenim el user_id del token
  const userId = token?.user_id || '';

  const fetchFriendsData = async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(`${API_URL}friends?userId=${userId}`);
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
      <View className="app-bar" style={{
        height: 80, backgroundColor: "#262626",
        alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
      }}>
        <Pressable onPress={() => { 
          if (router.canGoBack()) {
            showReproBar(true);
            router.back();
          } else {
            showReproBar(true);
            router.push("/"); // Navigate to home screen if no back history
          } }} style={{ backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name="arrow-back" size={30} color="white" style={{ left: 0 }} />
        </Pressable>
        <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
          Friends
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#F05858", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: 10 }}>
            {token ? `${token.user_id}` : "No Token"}
          </Text>
          <MaterialIcons
            name={token ? "person" : "login"} // Show "person" if token exists, otherwise "login"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/profileScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
        </View>
      </View>
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
