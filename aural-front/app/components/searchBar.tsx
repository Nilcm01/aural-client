import React, { useState } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import HistoryContainer from "../components/historyContainer";
import { useNavigation } from "@react-navigation/native";
import { useToken } from "../context/TokenContext";

// Interfície per als resultats de cerca d'usuaris
interface UserMatch {
  target: string;
  rating: number;
  userId: string;
  imageURL: string;
}

// Interfície per als resultats de cerca de contingut (àlbums, tracks, artistes)
interface ContentItem {
  id: string;
  name: string;
  type: string;
  images: { url: string }[];
  artists?: { name: string }[];
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useToken();
  const [query, setQuery] = useState<string>("");
  const [userResults, setUserResults] = useState<UserMatch[]>([]);
  const [albums, setAlbums] = useState<ContentItem[]>([]);
  const [tracks, setTracks] = useState<ContentItem[]>([]);
  const [artists, setArtists] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Variables per controlar el límit inicial de resultats per secció
  const [albumLimit, setAlbumLimit] = useState<number>(5);
  const [trackLimit, setTrackLimit] = useState<number>(5);
  const [artistLimit, setArtistLimit] = useState<number>(5);

  // Funció per obtenir tots els usuaris (per enriquir resultats de cerca d'usuaris)
  const fetchAllUsers = async (): Promise<any[]> => {
    try {
      const resp = await fetch("http://localhost:5000/api/items/users");
      if (!resp.ok) throw new Error("Error fetching all users");
      const allUsers = await resp.json();
      return allUsers;
    } catch (err) {
      console.error("Error al obtenir tots els usuaris:", err);
      return [];
    }
  };

  // Cerca d'usuaris (utilitza l'endpoint que retorna target i rating)
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
      if (!response.ok)
        throw new Error("Network response was not ok in search-user");
      const data: Array<{ target: string; rating: number }> = await response.json();
      // Enriquir resultats amb userId i imageURL
      const allUsers = await fetchAllUsers();
      const enrichedResults: UserMatch[] = data.map((match) => {
        const found = allUsers.find((u: any) => u.username === match.target);
        return {
          target: match.target,
          rating: match.rating,
          userId: found ? found.userId : match.target, // fallback
          imageURL: found && found.imageURL ? found.imageURL : "https://example.com/default-image.jpg",
        };
      });
      setUserResults(enrichedResults);
    } catch (err) {
      console.error(err);
      setError("Error al buscar usuaris.");
    } finally {
      setLoading(false);
    }
  };

  // Cerca de contingut a Spotify (àlbums, tracks i artistes)
  const handleSearchContent = async () => {
    if (!query.trim()) {
      setAlbums([]);
      setTracks([]);
      setArtists([]);
      return;
    }
    if (!token?.access_token) {
      setError("No hi ha token de Spotify disponible.");
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
      if (!response.ok) throw new Error("Spotify response was not ok");
      const data = await response.json();
      const albumsData: ContentItem[] = data.albums ? data.albums.items : [];
      const tracksData: ContentItem[] = data.tracks ? data.tracks.items : [];
      const artistsData: ContentItem[] = data.artists ? data.artists.items : [];
      setAlbums(albumsData);
      setTracks(tracksData);
      setArtists(artistsData);
    } catch (err) {
      console.error(err);
      setError("Error al cercar contingut.");
    } finally {
      setLoading(false);
    }
  };

  // Crida a ambdues funcions de cerca
  const handleSearch = async () => {
    await handleSearchUsers();
    await handleSearchContent();
  };

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
      if (!response.ok) throw new Error("Network response was not ok in sendFriendRequest");
      alert("Friend request sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send friend request.");
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
          // TODO: Implement navigation to album detail
          console.log("Album clicked: ", item.id);
        }}
      >
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0].url : "https://example.com/default-image.jpg" }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Album</Text>
    </View>
  );

  const renderTrackItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        onPress={() => {
          // TODO: Implement navigation to track detail
          console.log("Track clicked: ", item.id);
        }}
      >
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0].url : "https://example.com/default-image.jpg" }}
          style={styles.userImage}
        />
        <Text style={styles.username}>{item.name}</Text>
      </TouchableOpacity>
      <Text style={styles.contentType}>Track</Text>
    </View>
  );

  const renderArtistItem = ({ item }: { item: ContentItem }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity
        onPress={() => {
          // TODO: Implement navigation to artist detail
          console.log("Artist clicked: ", item.id);
        }}
      >
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0].url : "https://example.com/default-image.jpg" }}
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

        {/* Secció de tracks */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141218",
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
});

export default SearchScreen;
