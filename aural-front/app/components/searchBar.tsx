import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import HistoryContainer from "../components/historyContainer";
import { router, useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { useToken } from "../context/TokenContext";
import QueueModal from "../components/QueueModal";
import { useQueue } from "../context/QueueContext";
import AlbumInfo from "./checkAlbumInfo";

// Interfície per als resultats de cerca d'usuaris
interface UserMatch {
  target: string;
  rating: number;
  userId: string;
  imageURL: string;
}

// Interfície per als resultats de cerca de contingut (àlbums, pistes i artistes)
interface ContentItem {
  id: string;
  name: string;
  type: string;
  // Para que funcione tanto con álbumes que puedan venir con "images" directamente y con tracks que tienen "album.images":
  album?: {
    images: { url: string }[];
  };
  images?: { url: string }[]; // Si es un objeto que ya trae imágenes directamente (por ejemplo, un álbum)
  artists?: { name: string }[];
  uri?: string;
}


const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useToken(); // token es del tipo TokenData | null
  // Usamos el contexto para gestionar la cola
  const { queue, addToQueue, removeFromQueue, clearQueue, updateQueue } = useQueue();

  const [query, setQuery] = useState<string>("");
  const [userResults, setUserResults] = useState<UserMatch[]>([]);
  const [albums, setAlbums] = useState<ContentItem[]>([]);
  const [tracks, setTracks] = useState<ContentItem[]>([]);
  const [artists, setArtists] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Límit per secció
  const [albumLimit, setAlbumLimit] = useState<number>(5);
  const [trackLimit, setTrackLimit] = useState<number>(5);
  const [artistLimit, setArtistLimit] = useState<number>(5);

  // Estat per controlar la visibilitat del modal de Queue
  const [queueModalVisible, setQueueModalVisible] = useState<boolean>(false);

  // Debug: Mostrar en consola cada vegada que la cola canvia
  useEffect(() => {
    console.log("Queue updated:", JSON.stringify(queue));
  }, [queue]);

  // Sincronización de la cola real de Spotify (opcional)
  useEffect(() => {
    const fetchSpotifyQueue = async () => {
      if (!token?.access_token) return;
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player/queue", {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + token.access_token,
          },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Spotify queue:", data);
          if (data.queue) {
            const spotifyQueue = data.queue.map((track: any) => ({
              id: track.id,
              image: track.album && track.album.images && track.album.images[0]
                ? track.album.images[0].url
                : "https://example.com/default-image.jpg",
              name: track.name,
              uri: track.uri,
            }));
            updateQueue(spotifyQueue);
          }
        } else {
          console.error("Error fetching Spotify queue, status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching Spotify queue:", error);
      }
    };

    fetchSpotifyQueue();
    const interval = setInterval(fetchSpotifyQueue, 10000);
    return () => clearInterval(interval);
  }, [token, updateQueue]);

  // Funció per obtenir tots els usuaris
  const fetchAllUsers = async (): Promise<any[]> => {
    try {
      const resp = await fetch("http://localhost:5000/api/items/users");
      if (!resp.ok) throw new Error("Error fetching all users");
      return await resp.json();
    } catch (err) {
      console.error("Error fetching all users:", err);
      return [];
    }
  };

  // Cerca d'usuaris
  const handleSearchUsers = async () => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/items/search-user?username=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Network error in search-user");
      const data: Array<{ target: string; rating: number }> = await response.json();
      const allUsers = await fetchAllUsers();
      const enrichedResults: UserMatch[] = data.map((match) => {
        const found = allUsers.find((u: any) => u.username === match.target);
        return {
          target: match.target,
          rating: match.rating,
          userId: found ? found.userId : match.target,
          imageURL: found && found.imageURL ? found.imageURL : "https://example.com/default-image.jpg",
        };
      });
      setUserResults(enrichedResults);
    } catch (err) {
      console.error(err);
      setError("Error searching users.");
    } finally {
      setLoading(false);
    }
  };

  // Cerca de contingut a Spotify
  const handleSearchContent = async () => {
    if (!query.trim()) {
      setAlbums([]);
      setTracks([]);
      setArtists([]);
      return;
    }
    if (!token?.access_token) {
      setError("No Spotify token available.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,track,artist&limit=10`,
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + token.access_token,
          },
        }
      );
      if (!response.ok) throw new Error("Spotify response error");
      const data = await response.json();
      const albumsData: ContentItem[] = data.albums ? data.albums.items : [];
      const tracksData: ContentItem[] = data.tracks ? data.tracks.items : [];
      const artistsData: ContentItem[] = data.artists ? data.artists.items : [];
      setAlbums(albumsData);
      setTracks(tracksData);
      setArtists(artistsData);
    } catch (err) {
      console.error(err);
      setError("Error searching content.");
    } finally {
      setLoading(false);
    }
  };

  // Crida conjunta per la cerca
  const handleSearch = async () => {
    await handleSearchUsers();
    await handleSearchContent();
  };

  // Funció per enviar sol·licitud d'amistat
  const sendFriendRequest = async (friendId: string) => {
    try {
      const currentUserId = token?.user_id || "Test1Friends";
      const response = await fetch("http://localhost:5000/api/items/send-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: friendId,
        }),
      });
      if (!response.ok) throw new Error("Network error in sendFriendRequest");
      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send friend request.");
    }
  };

  // Funció per reproduir una pista
  const playTrack = async (uri: string | undefined) => {
    if (!uri) {
      Alert.alert("Error", "No valid track URI");
      return;
    }
    if (!token?.access_token) {
      Alert.alert("Error", "No Spotify token available.");
      return;
    }
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + token.access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      });
      if (!response.ok) throw new Error("Network error in playTrack");
      Alert.alert("Playing", "Track is now playing!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to play track.");
    }
  };

  // Funció per afegir una pista a la cua, usant el context per actualizar la cola global
  const handleAddToQueue = async (
    uri: string | undefined,
    track: { id: string; image: string; name: string; uri: string }
  ) => {
    if (!uri) {
      Alert.alert("Error", "No valid track URI");
      return;
    }
    if (!token?.access_token) {
      Alert.alert("Error", "No Spotify token available.");
      return;
    }
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        Alert.alert("Success", "Track added to queue!");
        addToQueue({ id: track.id, image: track.image, name: track.name, uri });
      } else {
        const errorText = await response.text();
        console.error("Error adding track to queue:", response.status, errorText);
        Alert.alert("Error", "Failed to add track to queue via Spotify. Adding locally for testing.");
        addToQueue({ id: track.id, image: track.image, name: track.name, uri });
      }
    } catch (error) {
      console.error("Exception in addToQueue:", error);
      Alert.alert("Error", "Exception occurred. Adding track to queue locally.");
      addToQueue({ id: track.id, image: track.image, name: track.name, uri });
    }
  };

  const renderUserItem = ({ item }: { item: UserMatch }) => (
    <View style={styles.resultItem}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.imageURL }} style={styles.userImage} />
        <TouchableOpacity onPress={() => navigation.navigate("UserProfile", { username: item.target })}>
          <Text style={styles.username}>{item.target}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.friendRequestButton} onPress={() => sendFriendRequest(item.userId)}>
        <Text style={styles.buttonText}>Send Friend Request</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAlbumItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/components/checkAlbumInfo',
            params: {
              type: item.type,
              name: item.name,
              // artists: item.artists || [],
            },
          });
        }}
      >
        <Image
          source={{
            uri: item.images && item.images.length > 0
              ? item.images[0].url
              : "https://example.com/default-image.jpg",
          }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Album</Text>
    </View>
  );

  const renderTrackItem = ({ item }: { item: ContentItem }) => {
    // Usamos la imagen del álbum ya que el track no trae "images" directamente
    const trackImageUri =
      item.album && item.album.images && item.album.images.length > 0
        ? item.album.images[0].url
        : "https://example.com/default-image.jpg";
        
    return (
      <View style={styles.resultItem}>
        <TouchableOpacity
          onPress={() => {
            playTrack(item.uri);
            console.log("Track clicked:", item.id);
          }}
        >
          <Image
            source={{ uri: trackImageUri }}
            style={styles.userImage}
          />
          <Text style={styles.username}>{item.name}</Text>
        </TouchableOpacity>
        <Text style={styles.contentType}>Track</Text>
        <TouchableOpacity
          style={styles.friendRequestButton}
          onPress={() =>
            handleAddToQueue(item.uri, {
              id: item.id,
              image: trackImageUri,
              name: item.name,
              uri: item.uri || "",
            })
          }
        >
          <Text style={styles.buttonText}>Add to Queue</Text>
        </TouchableOpacity>
      </View>
    );
  };


  const renderArtistItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity onPress={() => {
          router.push({
            pathname: '/components/checkArtistInfo',
            params: {
              type: item.type,
              name: item.name,
            },
          });
        }}>
        <Image
          source={{
            uri: item.images && item.images.length > 0
              ? item.images[0].url
              : "https://example.com/default-image.jpg",
          }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Artist</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="gray"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <MaterialIcons name="search" size={32} color="white" style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
        <HistoryContainer />
        {loading && <ActivityIndicator size="large" color="#f05858" />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Secció d'usuaris */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>Users</Text>
          <FlatList
            data={userResults}
            keyExtractor={(item) => item.userId}
            renderItem={renderUserItem}
            contentContainerStyle={styles.resultsContainer}
            scrollEnabled={false}
          />
        </View>

        {/* Secció d'àlbums */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <FlatList
            data={albums.slice(0, albumLimit)}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumItem}
            contentContainerStyle={styles.resultsContainer}
            scrollEnabled={false}
          />
          {albums.length > albumLimit && (
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setAlbumLimit(10)}>
              <Text style={styles.showMoreText}>Show More Albums</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Secció de pistes */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>Tracks</Text>
          <FlatList
            data={tracks.slice(0, trackLimit)}
            keyExtractor={(item) => item.id}
            renderItem={renderTrackItem}
            contentContainerStyle={styles.resultsContainer}
            scrollEnabled={false}
          />
          {tracks.length > trackLimit && (
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setTrackLimit(10)}>
              <Text style={styles.showMoreText}>Show More Tracks</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Secció d'artistes */}
        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={styles.sectionTitle}>Artists</Text>
          <FlatList
            data={artists.slice(0, artistLimit)}
            keyExtractor={(item) => item.id}
            renderItem={renderArtistItem}
            contentContainerStyle={styles.resultsContainer}
            scrollEnabled={false}
          />
          {artists.length > artistLimit && (
            <TouchableOpacity style={styles.showMoreButton} onPress={() => setArtistLimit(10)}>
              <Text style={styles.showMoreText}>Show More Artists</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Botó per obrir la cua de reproducció */}
      <TouchableOpacity style={styles.openQueueButton} onPress={() => setQueueModalVisible(true)}>
        <MaterialIcons name="queue-music" size={32} color="white" />
      </TouchableOpacity>

      <QueueModal
        token={token?.access_token || null}
        visible={queueModalVisible}
        onClose={() => setQueueModalVisible(false)}
        queue={queue}
        onRemoveItem={removeFromQueue}
        onClearQueue={clearQueue}
        onSkip={() => {
          Alert.alert("Skip", "Skipping track...");
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    width: "100%",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  searchInput: {
    height: 40,
    borderColor: "white",
    borderWidth: 2,
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    color: "black",
  },
  searchIcon: {
    marginLeft: 10,
  },
  resultsContainer: {
    marginTop: 20,
    width: "100%",
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: "#262626",
    padding: 20,
    borderRadius: 8,
    marginVertical: 20,
    width: "100%",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#ccc",
  },
  username: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  contentType: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
    fontStyle: "italic",
  },
  friendRequestButton: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 26,
    color: "#f05858",
    fontWeight: "bold",
    marginTop: 30,
  },
  showMoreButton: {
    backgroundColor: "#1DB954",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  showMoreText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
  openQueueButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1DB954",
    padding: 10,
    borderRadius: 50,
  },
});

export default SearchScreen;
