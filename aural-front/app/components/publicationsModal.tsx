// components/PublicationsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export type PublicationType = 'text' | 'image' | 'video' | 'link';

export interface Publication {
  id: string;        // _id de la publicación
  content: string;   // texto o URL
  userId: string;    // aquí recibes el ObjectId del autor
}

interface PublicationsModalProps {
  visible: boolean;
  onClose: () => void;
  publications: Publication[];
  onReload: () => void;
}

const PublicationsModal: React.FC<PublicationsModalProps> = ({
  visible,
  onClose,
  publications,
  onReload,
}) => {
  const [usersMap, setUsersMap] = useState<Record<string,string>>({});
  const API_BASE = 'https://aural-454910.ew.r.appspot.com/api/items';

  useEffect(() => {
    if (!visible) return;
    onReload();

    // 1) Traemos la lista completa de usuarios
    fetch(`${API_BASE}/users`)
      .then(r => r.json())
      .then((users: any[]) => {
        const m: Record<string,string> = {};
        users.forEach(u => {
          // u._id viene de Mongo, u.username (o u.name) del perfil
          m[u._id] = u.username || u.name || 'Unknown';
        });
        setUsersMap(m);
      })
      .catch(console.error);
  }, [visible]);

  const determineType = (c: string): PublicationType => {
    const lc = c.toLowerCase();
    if (/\.(jpe?g|png|gif)$/.test(lc)) return 'image';
    if (/\.(mp4|mov|mkv)$/.test(lc))  return 'video';
    if (c.startsWith('http'))          return 'link';
    return 'text';
  };

  const renderPublication = (item: Publication) => {
    const t = determineType(item.content);
    switch (t) {
      case 'image':
        return (
          <Image
            source={{ uri: item.content }}
            style={styles.media}
            resizeMode="contain"
          />
        );
      case 'video':
        return (
          <Video
            source={{ uri: item.content }}
            style={styles.media}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        );
        case 'link':
          return (
            <Text
              style={styles.link}
              onPress={() => Linking.openURL(item.content)}
            >
              {item.content}
            </Text>
          );
      default:
        return <Text style={styles.text}>{item.content}</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Publications feed</Text>

          <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
            <Text style={styles.reloadButtonText}>Reload feed</Text>
          </TouchableOpacity>

          {publications.length === 0 ? (
            <Text style={styles.empty}>No publications found.</Text>
          ) : (
            <FlatList
              data={publications}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  {/* mostramos username según el mapa, o "Unknown" */}
                  <Text style={styles.user}>
                    {usersMap[item.userId] ?? 'Unknown'}
                  </Text>
                  {renderPublication(item)}
                </View>
              )}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 24, color: '#f05858', fontWeight: 'bold',
    marginBottom: 12, textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#1DB954', padding: 10, borderRadius: 6,
    alignSelf: 'center', marginBottom: 12,
  },
  reloadButtonText: {
    color: 'white', fontWeight: 'bold',
  },
  empty: {
    color: 'white', textAlign: 'center', marginVertical: 20,
  },
  item: {
    backgroundColor: '#141218', padding: 12,
    borderRadius: 6, marginBottom: 10, alignItems: 'flex-start',
  },
  user: {
    fontSize: 16, color: '#f05858',
    fontWeight: 'bold', marginBottom: 6,
  },
  text: {
    fontSize: 16, color: 'white', alignSelf: 'center',
  },
  link: {
    fontSize: 16, color: '#1DB954',
    textDecorationLine: 'underline', alignSelf: 'center',
  },
  media: {
    width: '100%', height: 300,
    borderRadius: 6, marginTop: 6,
    alignSelf: 'center',
  },
  closeButton: {
    marginTop: 12, alignSelf: 'center',
  },
  closeButtonText: {
    color: '#f05858', textDecorationLine: 'underline',
  },
});

export default PublicationsModal;
