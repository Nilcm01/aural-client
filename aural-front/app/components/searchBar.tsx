import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import HistoryContainer from "../components/historyContainer";
import { useNavigation } from "@react-navigation/native";
import { useToken } from "../context/TokenContext";

// Interfície per als resultats de cerca original (sense userId ni imageURL)
interface RawUserMatch {
  target: string;
  rating: number;
}

// Interfície per als resultats de cerca enriquits
interface UserMatch {
  target: string;
  rating: number;
  userId: string;
  imageURL: string;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useToken();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<UserMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Funció per obtenir tots els usuaris (esperem que retorni un array d'usuaris amb { userId, username, imageURL })
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

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Primer, cridem l'endpoint de cerca que retorna només { target, rating }
      const response = await fetch(
        `http://localhost:5000/api/items/search-user?username=${encodeURIComponent(query)}`
      );
      if (!response.ok)
        throw new Error("Network response was not ok in search-user");
      const data: RawUserMatch[] = await response.json();
      
      // Ara, obtenim tots els usuaris per enriquir els resultats amb userId i imageURL
      const allUsers = await fetchAllUsers();
      
      // Enriquim cada resultat trobant el document d'usuaris on username coincideix amb target
      const enrichedResults: UserMatch[] = data.map((match) => {
        const found = allUsers.find((u: any) => u.username === match.target);
        return {
          target: match.target,
          rating: match.rating,
          userId: found ? found.userId : match.target,  // Fallback al target si no es troba
          imageURL: found && found.imageURL ? found.imageURL : "https://example.com/default-image.jpg",
        };
      });
      
      setResults(enrichedResults);
    } catch (err) {
      console.error(err);
      setError("Error al buscar usuaris.");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const currentUserId = token?.user_id || "Test1Friends";
      const response = await fetch("http://localhost:5000/api/items/send-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,       // Usuari que envia la sol·licitud
          friendId: friendId           // Usuari destinatari (ara amb el userId correcte)
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
        <Image 
          source={{ uri: item.imageURL }}
          style={styles.userImage}
        />
        <TouchableOpacity onPress={() => navigation.navigate("UserProfile", { username: item.target })}>
          <Text style={styles.username}>{item.target}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.friendRequestButton} onPress={() => sendFriendRequest(item.userId)}>
        <Text style={styles.buttonText}>Send Friend Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Users..."
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
      <FlatList
        data={results}
        keyExtractor={(item) => item.userId}
        renderItem={renderUserItem}
        contentContainerStyle={styles.resultsContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141218",
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
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
    marginTop: 40,
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
});

export default SearchScreen;
