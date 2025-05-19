import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Entity {
  _id: string;
  entityId: string; // ID de Spotify
  averageScore?: number;
  totalRatings?: number;
  weightedScore?: number;
}

interface RankingModalProps {
  token: string | null; // Spotify OAuth token
  visible: boolean;
  entityType: 'song' | 'artist';
  onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({
  token,
  visible,
  entityType,
  onClose,
}) => {
  const [topRated, setTopRated] = useState<Entity[]>([]);
  const [topWeighted, setTopWeighted] = useState<Entity[]>([]);
  const [mostRated, setMostRated] = useState<Entity[]>([]);
  const [nameMap, setNameMap] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && token) {
      fetchRankings();
    }
  }, [visible]);

  const fetchSpotifyNames = async (
    ids: string[],
    type: 'song' | 'artist',
    spotifyToken: string
  ) => {
    const nameMap: { [id: string]: string } = {};

    await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(
            `https://api.spotify.com/v1/${type === 'song' ? 'tracks' : 'artists'}/${id}`,
            {
              headers: { Authorization: `Bearer ${spotifyToken}` },
            }
          );
          if (!res.ok) throw new Error(`Spotify request failed for ID ${id}`);
          const data = await res.json();

          if (type === 'song') {
            nameMap[id] = `${data.name} - ${data.artists?.[0]?.name ?? 'Unknown Artist'}`;
          } else {
            nameMap[id] = data.name;
          }
        } catch (err) {
          console.warn(`Error fetching name for ID ${id}:`, err);
        }
      })
    );

    return nameMap;
  };

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const endpoints = [
        `http://localhost:5000/api/items/top-rated-entities?entityType=${entityType}`,
        `http://localhost:5000/api/items/top-weighted-entities?entityType=${entityType}`,
        `http://localhost:5000/api/items/most-rated-entities?entityType=${entityType}`,
      ];

      const [resTop, resWeighted, resMost] = await Promise.all(
        endpoints.map((url) => fetch(url, { headers }))
      );

      const [dataTop, dataWeighted, dataMost] = await Promise.all([
        resTop.json(),
        resWeighted.json(),
        resMost.json(),
      ]);

      const top10 = (arr: Entity[] = []) => arr.slice(0, 10);

      const top = top10(dataTop.entities || []);
      const weighted = top10(dataWeighted.entities || []);
      const most = top10(dataMost.entities || []);

      const ids = Array.from(
        new Set([...top, ...weighted, ...most].map((e: any) => e.entityId).filter(Boolean))
      );

      if (!token || ids.length === 0) {
        console.warn('No token or empty list of IDs');
        return;
      }

      const names = await fetchSpotifyNames(ids, entityType, token);
      setNameMap(names);

      setTopRated(top);
      setTopWeighted(weighted);
      setMostRated(most);
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem =
    (emoji: string, key: keyof Entity) =>
    ({ item }: { item: Entity }) => {
      const name = nameMap[item.entityId] || 'Unknown';
      return (
        <View style={styles.itemRow}>
          <Text style={styles.itemText}>{name}</Text>
          {item[key] !== undefined && (
            <Text style={styles.itemScore}>
              {emoji}{' '}
              {typeof item[key] === 'number'
                ? (item[key] as number).toFixed(2)
                : item[key]}
            </Text>
          )}
        </View>
      );
    };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={30} color="#f05858" />
            </TouchableOpacity>
            <Text style={styles.title}>Song Rankings</Text>
            <View style={{ width: 30 }} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#f05858" />
          ) : (
            <FlatList
              ListHeaderComponent={
                <>
                  <Text style={styles.sectionTitle}>⭐ Top Rated</Text>
                  <FlatList
                    data={topRated}
                    renderItem={renderItem('⭐', 'averageScore')}
                    keyExtractor={(item) => item._id}
                  />
                  <Text style={styles.sectionTitle}>⚖️ Top Weighted</Text>
                  <FlatList
                    data={topWeighted}
                    renderItem={renderItem('⚖️', 'weightedScore')}
                    keyExtractor={(item) => item._id}
                  />
                  <Text style={styles.sectionTitle}>💬 Most Rated</Text>
                  <FlatList
                    data={mostRated}
                    renderItem={renderItem('💬', 'totalRatings')}
                    keyExtractor={(item) => item._id}
                  />
                </>
              }
              data={[]}
              renderItem={null}
              keyExtractor={(_, index) => `header-${index}`}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#262626',
    borderRadius: 20,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#f05858',
    fontSize: 20,
    marginVertical: 10,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  itemScore: {
    color: '#f5c542',
    fontSize: 14,
    marginLeft: 10,
  },
});

export default RankingModal;
