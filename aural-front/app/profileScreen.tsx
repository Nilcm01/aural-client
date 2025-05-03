import React, { useEffect, useState } from 'react';
import { useRouter } from "expo-router";
import { Image, Text, View, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { MaterialIcons } from "@expo/vector-icons";
import { useToken } from "./context/TokenContext";
import { FlatList, ActivityIndicator } from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
  const { token } = useToken();
  const [username, setUsername] = useState(token?.user_id);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para los modales
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);

  // Fetch user profile data when component mounts
  useEffect(() => {
    if (token && token.user_id) {
      fetch(`http://localhost:5000/api/items/profile-info?userId=${token.user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Initialize data from ddbb
          setName(data.name);
          setAge(data.age);
          setDescription(data.description);
          setProfileImage(data.imageURL);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
          setErrorMessage("Failed to load profile data.");
        });
    }
  }, [token]);

  // Manage data modification
  const handleSaveChanges = () => {
    if (!token) {
      setErrorMessage("You need to be logged in to save changes.");
      return;
    }

    // Send updated profile data to backend
    if (token && token.user_id) {
      fetch(`http://localhost:5000/api/items/modify-profile?userId=${token.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: token.user_id,
          name: name,
          age: age,
          description: description,
          imageURL: profileImage,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile updated:", data);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setErrorMessage("There was an issue updating your profile.");
      });
    }
  };

  // Handle navigation to the previous screen
  const goBack = () => {
    // Returns Home
    router.push("/");
  };

  const openOptionsMenu = () => {
    setMenuVisible(true);
  };

  const closeOptionsMenu = () => {
    setMenuVisible(false);
  };

  const openHistoryModal = () => {
    setMenuVisible(false);
    setHistoryModalVisible(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalVisible(false);
  };

  const openStatsModal = () => {
    setHistoryModalVisible(false);
    setStatsModalVisible(true);
  };

  const closeStatsModal = () => {
    setStatsModalVisible(false);
  };

  // UserHistoryScreen components
  // Esta función formatea la fecha ISO a formato local
  const formatDate = (iso: string | number | Date) => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  // Esta función formatea los segundos a formato min:seg
  const formatPlaytime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Estado para el historial de música
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Función para obtener el historial
  const fetchHistory = async () => {
    try {
      const userId = token?.user_id;
      if (!userId) throw new Error("User ID is missing");
  
      const response = await fetch(`http://localhost:5000/api/items/get-history/${token.user_id}?limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      

      const data = await response.json();
  
      if (response.ok) {
        setHistory(data.history);
      } else {
        console.error("History API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userId = token?.user_id;
      if (!userId) throw new Error("User ID is missing");
  
      const response = await fetch(`http://localhost:5000/api/items/get-stats/${token.user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
  
      if (response.ok) {
        setStats(data.stats); // Asumiendo que tienes `const [stats, setStats] = useState(...)`
      } else {
        console.error("Stats API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false); // Si tienes loading para stats
    }
  };

  // Cargar el historial cuando se abre el modal
  useEffect(() => {
    if (historyModalVisible) {
      setLoadingHistory(true);
      fetchHistory();
      fetchStats(); 
    }
  }, [historyModalVisible]);

  // Renderizar cada elemento del historial
  interface HistoryItem {
    userId: string;
    songId: string;
    songName: string;
    artistId: string;
    artistName: string;
    artistImageUrl: string;
    albumName: string;
    albumImageUrl: string;
    length: number;
    timestamp: string;
  }

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={historyStyles.historyItem}>
      <Image source={{ uri: item.albumImageUrl }} style={historyStyles.albumThumb} />
      <View style={historyStyles.historyItemDetails}>
        <Text style={historyStyles.songName}>{item.songName}</Text>
        <Text style={historyStyles.artistName}>{item.artistName}</Text>
        <Text style={historyStyles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={historyStyles.songLength}>{formatPlaytime(item.length)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.iconContainer}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity onPress={openOptionsMenu} style={styles.iconContainer}>
          <Icon name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile photo */}
      <TouchableOpacity style={styles.profileImageContainer}>
        { profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Image
            source={{ uri: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' }}
            style={styles.profileImage}
          />
        )}
      </TouchableOpacity>

      {/* Profile fields */}
      <View style={styles.form}>
        {/* Username (non-editable) */}
        <TextInput
          style={styles.input}
          value={username}
          editable={false}
          placeholder="Username"
        />

        {/* Name */}
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          maxLength={25}
        />

        {/* Age */}
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Age"
          keyboardType="numeric"
          maxLength={25}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          maxLength={200} // Character limit (200 for description)
        />
      </View>

      {/* Error message */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* Save Changes button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Options modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={closeOptionsMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeOptionsMenu}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={openHistoryModal}>
              <Text style={styles.menuText}>User history</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={openStatsModal}>
              <Text style={styles.menuText}>Stats</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* UserHistoryScreen Modal */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeHistoryModal}
      >
        <View style={historyStyles.modalOverlay}>
          <View style={historyStyles.modalContent}>
            <View style={historyStyles.topBar}>
              <TouchableOpacity onPress={closeHistoryModal}>
                <MaterialIcons name="arrow-back-ios" size={30} color="#ffffff" />
              </TouchableOpacity>
              <Text style={historyStyles.title}>Your Music</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={historyStyles.tabContainer}>
              <TouchableOpacity style={[historyStyles.tab, historyStyles.activeTab]}>
                <Text style={[historyStyles.tabText, historyStyles.activeTabText]}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={historyStyles.tab} onPress={openStatsModal}>
                <Text style={historyStyles.tabText}>Statistics</Text>
              </TouchableOpacity>
            </View>

            {loadingHistory ? (
              <View style={historyStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#F05858" />
                <Text style={historyStyles.loadingText}>Loading your music history...</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => `${item.songId}-${index}`}
                contentContainerStyle={historyStyles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* StatsScreen Modal (placeholder) */}
      <Modal
        visible={statsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeStatsModal}
      >
        <View style={historyStyles.modalOverlay}>
          <View style={historyStyles.modalContent}>
            <View style={historyStyles.topBar}>
              <TouchableOpacity onPress={closeStatsModal}>
                <MaterialIcons name="arrow-back-ios" size={30} color="#ffffff" />
              </TouchableOpacity>
              <Text style={historyStyles.title}>Your Music</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={historyStyles.tabContainer}>
              <TouchableOpacity style={historyStyles.tab} onPress={() => {
                closeStatsModal();
                setHistoryModalVisible(true);
              }}>
                <Text style={historyStyles.tabText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[historyStyles.tab, historyStyles.activeTab]}>
                <Text style={[historyStyles.tabText, historyStyles.activeTabText]}>Statistics</Text>
              </TouchableOpacity>
            </View>

            <View style={historyStyles.loadingContainer}>
              <Text style={historyStyles.loadingText}></Text>
            </View>
            {loadingStats ? (
              <View style={historyStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#F05858" />
                <Text style={historyStyles.loadingText}>Loading stats...</Text>
              </View>
            ) : stats && stats.topSongs && stats.topArtists ? (
              <FlatList
                ListHeaderComponent={
                  [stats.totalPlaytime, stats.playtimeToday, stats.playtimeLast7Days, stats.playtimeLast30Days].some(p => p != null) ? (
                    <View style={{ paddingBottom: 10 }}>
                      <Text style={statsStyles.sectionTitle}>Playtime</Text>
                      {stats.totalPlaytime != null && (
                        <Text style={statsStyles.stat}>Total: {formatPlaytime(stats.totalPlaytime)}</Text>
                      )}
                      {stats.playtimeToday != null && (
                        <Text style={statsStyles.stat}>Today: {formatPlaytime(stats.playtimeToday)}</Text>
                      )}
                      {stats.playtimeLast7Days != null && (
                        <Text style={statsStyles.stat}>Last 7 days: {formatPlaytime(stats.playtimeLast7Days)}</Text>
                      )}
                      {stats.playtimeLast30Days != null && (
                        <Text style={statsStyles.stat}>Last 30 days: {formatPlaytime(stats.playtimeLast30Days)}</Text>
                      )}
                    </View>
                  ) : null
                }
                data={[
                  { label: "Today", data: stats.topSongs?.today || [], type: "Songs" },
                  { label: "Last 7 days", data: stats.topSongs?.last7Days || [], type: "Songs" },
                  { label: "Last 30 days", data: stats.topSongs?.last30Days || [], type: "Songs" },
                  { label: "All time", data: stats.topSongs?.allTime || [], type: "Songs" },
                  { label: "Today", data: stats.topArtists?.today || [], type: "Artists" },
                  { label: "Last 7 days", data: stats.topArtists?.last7Days || [], type: "Artists" },
                  { label: "Last 30 days", data: stats.topArtists?.last30Days || [], type: "Artists" },
                  { label: "All time", data: stats.topArtists?.allTime || [], type: "Artists" },
                ]}
                keyExtractor={(item, index) => `${item.type}-${item.label}-${index}`}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={statsStyles.sectionTitle}>
                      Top 10 {item.type} - {item.label}
                    </Text>
                    {item.data.length === 0 ? (
                      <Text style={statsStyles.stat}>No data</Text>
                    ) : (
                      item.data.map((entry: any, idx: number) => (
                        <View key={idx} style={statsStyles.entryRow}>
                          <Image
                            source={{ uri: entry.imageUrl }}
                            style={statsStyles.thumbnail}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={statsStyles.entryTitle}>{entry.name}</Text>
                            {item.type === "Songs" && (
                              <Text style={statsStyles.entrySubtitle}>
                                {entry.albumName} • {entry.length && formatPlaytime(entry.length)}
                              </Text>
                            )}
                          </View>
                          <Text style={statsStyles.playtime}>{formatPlaytime(entry.playtime)}</Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={statsStyles.stat}>No statistics available.</Text>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos del ProfileScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    padding: 10,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 70,
    backgroundColor: '#333',
    borderColor: '#666',
    borderWidth: 0.5,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
  },
  input: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '75%',
  },
  descriptionInput: {
    paddingTop: 5,
    height: 80,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 7.5,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 5,
    width: '30%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  menuContainer: {
    backgroundColor: "#2B2B2B",
    borderRadius: 10,
    paddingVertical: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  
  menuText: {
    color: "#fff",
    fontSize: 16,
  },  
});

// Estilos para el UserHistoryScreen como modal
const historyStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    width: "90%",
    height: "90%",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#2D2D2D",
  },
  activeTab: {
    backgroundColor: "#F05858",
  },
  tabText: {
    color: "#CFCFCF",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#2B2B2B",
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  albumThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  historyItemDetails: {
    flex: 1,
  },
  songName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  artistName: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  timestamp: {
    color: "#888888",
    fontSize: 12,
  },
  songLength: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
  },
});

const statsStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 5,
  },
  stat: {
    color: "#cccccc",
    marginBottom: 2,
    alignContent: "center"
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2B2B",
    marginVertical: 4,
    padding: 8,
    borderRadius: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  entrySubtitle: {
    fontSize: 12,
    color: "#aaaaaa",
  },
  playtime: {
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 12,
  },
});

export default ProfileScreen;