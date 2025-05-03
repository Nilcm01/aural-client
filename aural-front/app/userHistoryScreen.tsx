import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // ✅ Importación añadida
import { useToken } from "./context/TokenContext";

interface HistoryEntry {
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

interface UserHistoryScreenProps {
  visible: boolean;
  onClose: () => void;
  onSwitchToStats: () => void;
}

const UserHistoryScreen: React.FC<UserHistoryScreenProps> = ({
  visible,
  onClose,
  onSwitchToStats,
}) => {
  if (!visible) return null;

  const { token } = useToken();
  const userId = token?.user_id || "mock-user-id";

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      // Datos de prueba para demostración
      const mockHistory: HistoryEntry[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - i * 3);
        return {
          userId,
          songId: `song-${i}`,
          songName: `Song ${30 - i}`,
          artistId: `artist-${i % 5}`,
          artistName: `Artist ${i % 5}`,
          artistImageUrl: `https://via.placeholder.com/150?text=Artist${i % 5}`,
          albumName: `Album ${i % 8}`,
          albumImageUrl: `https://via.placeholder.com/300?text=Album${i % 8}`,
          length: 180 + (i % 5) * 30,
          timestamp: date.toISOString(),
        };
      });

      setHistory(mockHistory);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchHistory();
    }
  }, [visible]);

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.albumImageUrl }} style={styles.albumThumb} />
      <View style={styles.historyItemDetails}>
        <Text style={styles.songName}>{item.songName}</Text>
        <Text style={styles.artistName}>{item.artistName}</Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.songLength}>{formatPlaytime(item.length)}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="arrow-back-ios" size={35} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Your Music</Text>
            <View style={{ width: 35 }} />
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={onSwitchToStats}>
              <Text style={styles.tabText}>Statistics</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F05858" />
              <Text style={styles.loadingText}>Loading your music history...</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => `${item.songId}-${index}`}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UserHistoryScreen;
