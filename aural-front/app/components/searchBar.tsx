// app/components/SearchScreen.tsx
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useToken } from "../context/TokenContext";
import QueueModal from "../components/QueueModal";
import { useQueue } from "../context/QueueContext";
import HistoryContainer from "../components/historyContainer";
import { router, useFocusEffect } from "expo-router";
import { useReproBarVisibility } from "./WebPlayback";


interface UserMatch {
  target: string;
  rating: number;
  userId: string;
  imageURL: string;
}

interface ContentItem {
  id: string;
  name: string;
  type: string;
  album?: { images: { url: string }[] };
  images?: { url: string }[];
  artists?: { name: string }[];
  uri?: string;
}

const API_URL = 'https://aural-454910.ew.r.appspot.com/api/items/';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useToken();
  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
    showReproBar(true);
    return () => {};
  });
  const { queue, addToQueue, updateQueue, removeFromQueue, clearQueue } = useQueue();

  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<UserMatch[]>([]);
  const [albums, setAlbums] = useState<ContentItem[]>([]);
  const [tracks, setTracks] = useState<ContentItem[]>([]);
  const [artists, setArtists] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [albumLimit, setAlbumLimit] = useState(5);
  const [trackLimit, setTrackLimit] = useState(5);
  const [artistLimit, setArtistLimit] = useState(5);

  const [queueModalVisible, setQueueModalVisible] = useState(false);

  // Sincronizar cola Spotify
  useEffect(() => {
    if (!token?.access_token) return;
    const fetchQueue = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player/queue", {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.queue) {
          updateQueue(
            data.queue.map((t: any) => ({
              id: t.id,
              image: t.album?.images?.[0]?.url ?? "",
              name: t.name,
              uri: t.uri,
            }))
          );
        }
      } catch { }
    };
    fetchQueue();
    const iv = setInterval(fetchQueue, 10000);
    return () => clearInterval(iv);
  }, [token, updateQueue]);

  // Search users...
  const fetchAllUsers = async () => {
    try {

      const r = await fetch(`${API_URL}users`);

      if (!r.ok) throw new Error();
      return await r.json();
    } catch {
      return [];
    }
  };
  const handleSearchUsers = async () => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch(
        `${API_URL}search-user?username=${encodeURIComponent(
          query
        )}`
      );
      if (!r.ok) throw new Error();
      const data: Array<{ target: string; rating: number }> = await r.json();
      const all = await fetchAllUsers();
      setUserResults(
        data.map((m) => {
          const u = all.find((x: any) => x.username === m.target);
          return {
            target: m.target,
            rating: m.rating,
            userId: u?.userId ?? m.target,
            imageURL: u?.imageURL ?? "",
          };
        })
      );
    } catch {
      setError("Error searching users.");
    }
    setLoading(false);
  };

  // Search Spotify content...
  const handleSearchContent = async () => {
    if (!query.trim()) {
      setAlbums([]);
      setTracks([]);
      setArtists([]);
      return;
    }
    if (!token?.access_token) {
      setError("No token");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=album,track,artist&limit=10`,
        { headers: { Authorization: `Bearer ${token.access_token}` } }
      );
      if (!r.ok) throw new Error();
      const d = await r.json();
      setAlbums(d.albums?.items ?? []);
      setTracks(d.tracks?.items ?? []);
      setArtists(d.artists?.items ?? []);
    } catch {
      setError("Error searching content.");
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    await handleSearchUsers();
    await handleSearchContent();
  };

  const playTrack = async (uri?: string) => {
    if (!uri || !token?.access_token) return Alert.alert("Error", "No URI/token");
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      });
    } catch {
      Alert.alert("Error", "Play failed");
    }
  };
  const handleAddToQueue = async (uri?: string, track?: any) => {
    if (!uri || !token?.access_token) return Alert.alert("Error", "No URI/token");
    try {
      const r = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token.access_token}` },
        }
      );
      if (!r.ok) throw new Error();
      addToQueue(track);
    } catch {
      addToQueue(track);
      Alert.alert("Error", "Added locally");
    }
  };

  const renderUserItem = ({ item }: any) => (
    <View style={styles.resultItem}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.imageURL }} style={styles.userImage} />
        <Text style={styles.username}>{item.target}</Text>
      </View>
      <TouchableOpacity style={styles.friendRequestButton}>
        <Text style={styles.buttonText}>Friend</Text>
      </TouchableOpacity>
    </View>
  );
  const renderAlbumItem = ({ item }: any) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("checkAlbumInfo/[id]", {
            id: item.id,
            name: item.name,
          })
        }
      >
        <Image
          source={{ uri: item.images?.[0]?.url ?? "" }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Album</Text>
    </View>
  );
  const renderTrackItem = ({ item }: any) => {
    const img = item.album?.images?.[0]?.url ?? "";
    return (
      <View style={styles.resultItem}>
        <TouchableOpacity onPress={() => playTrack(item.uri)}>
          <Image source={{ uri: img }} style={styles.userImage} />
          <Text style={styles.username}>{item.name}</Text>
        </TouchableOpacity>
        <Text style={styles.contentType}>Track</Text>
        <TouchableOpacity
          style={styles.friendRequestButton}
          onPress={() =>
            handleAddToQueue(item.uri, {
              id: item.id,
              image: img,
              name: item.name,
              uri: item.uri,
            })
          }
        >
          <Text style={styles.buttonText}>Add Queue</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const renderArtistItem = ({ item }: any) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("checkArtistInfo/[id]", {
            id: item.id,
            name: item.name,
          })
        }
      >
        <Image
          source={{ uri: item.images?.[0]?.url ?? "" }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Artist</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{
        height: 80, backgroundColor: "#262626",
        alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
      }}>
        {/* To be later replaced dynamic title */}
        <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}> Search </Text>
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
          <Ionicons
            name="people-circle-outline"
            size={30}
            color="white"
            onPress={() => {
              if (token) {
                router.push("/FriendsScreen");
              } else {
                router.push("/loginScreen"); // Navigate to login screen
              }
            }}
          />
        </View>
      </View>

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
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/*<HistoryContainer />*/}

        {loading && <ActivityIndicator size="large" color="#f05858" />}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>{userResults.length > 0 ? "Users" : ""}</Text>
          <FlatList
            data={userResults}
            keyExtractor={(i) => i.userId}
            renderItem={renderUserItem}
            scrollEnabled={false}
          />
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>{albums.length > 0 ? "Albums" : ""}</Text>
          <FlatList
            data={albums.slice(0, albumLimit)}
            keyExtractor={(i) => i.id}
            renderItem={renderAlbumItem}
            scrollEnabled={false}
          />
          {albums.length > albumLimit && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setAlbumLimit(albums.length)}
            >
              <Text style={styles.showMoreText}>Show More Albums</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.sectionTitle}>{tracks.length > 0 ? "Tracks" : ""}</Text>
          <FlatList
            data={tracks.slice(0, trackLimit)}
            keyExtractor={(i) => i.id}
            renderItem={renderTrackItem}
            scrollEnabled={false}
          />
          {tracks.length > trackLimit && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setTrackLimit(tracks.length)}
            >
              <Text style={styles.showMoreText}>Show More Tracks</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={styles.sectionTitle}>{artists.length > 0 ? "Artists" : ""}</Text>
          <FlatList
            data={artists.slice(0, artistLimit)}
            keyExtractor={(i) => i.id}
            renderItem={renderArtistItem}
            scrollEnabled={false}
          />
          {artists.length > artistLimit && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setArtistLimit(artists.length)}
            >
              <Text style={styles.showMoreText}>Show More Artists</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.openQueueButton}
        onPress={() => setQueueModalVisible(true)}
      >
        <MaterialIcons name="queue-music" size={30} color="white" />
      </TouchableOpacity>
      <QueueModal
        token={token?.access_token || null}
        visible={queueModalVisible}
        onClose={() => setQueueModalVisible(false)}
        queue={queue}
        onRemoveItem={removeFromQueue}
        onClearQueue={clearQueue}
        onSkip={() => Alert.alert("Skip")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    width: "100%",
  },
  scrollContainer: { padding: 20, flexGrow: 1, marginTop: 80, marginBottom: 100 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    color: "black",
  },
  searchButton: {
    backgroundColor: "#F05858",
    borderRadius: 40,
    padding: 9,
    marginLeft: 10,
  },
  resultItem: { backgroundColor: "#262626", padding: 20, borderRadius: 8, marginVertical: 10 },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  userImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  username: { fontSize: 18, color: "white", fontWeight: "bold" },
  contentType: { fontSize: 14, color: "white", fontStyle: "italic", marginTop: 5 },
  friendRequestButton: { backgroundColor: "#1DB954", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
  sectionTitle: { fontSize: 22, color: "#f05858", fontWeight: "bold" },
  showMoreButton: {
    backgroundColor: "#1DB954",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  showMoreText: { color: "white", fontWeight: "bold" },
  errorText: { color: "red", textAlign: "center", marginVertical: 10 },
  openQueueButton: {
    backgroundColor: "#F05858",
    padding: 17,
    borderRadius: 40,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 140,
    right: 20
  },
});

export default SearchScreen;
