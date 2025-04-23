import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface QueueItem {
  id: string;
  image: string;
  name: string;
  uri: string;
}

interface QueueModalProps {
  token: string | null;
  visible: boolean;
  onClose: () => void;
  queue: QueueItem[];
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onSkip: () => void;
  // Puedes agregar onReload si deseas tener un botón de refresco
  // onReload?: () => void;
}

const QueueModal: React.FC<QueueModalProps> = ({
  token,
  visible,
  onClose,
  onClearQueue,
  queue,
  onRemoveItem,
  onSkip,
  // onReload, // Si se desea usar un refresh
}) => {
  const renderQueueItem = ({ item, index }: { item: QueueItem; index: number }) => (
    <View style={styles.queueItem}>
      <Image
        source={{ uri: item.image || "https://example.com/default-image.jpg" }}
        style={styles.queueImage}
      />
      <Text style={styles.queueText}>{item.name}</Text>
      <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={{display: 'none'}}>
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Barra superior: Botones para cerrar y saltar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={30} color="#f05858" />
            </TouchableOpacity>
            <Text style={styles.title}>Queue of Tracks</Text>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <MaterialIcons name="skip-next" size={30} color="white" />
            </TouchableOpacity>
          </View>
          {/* Si la cola está vacía */}
          {queue.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>The queue is empty.</Text>
            </View>
          ) : (
            <FlatList
              data={queue}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={renderQueueItem}
              contentContainerStyle={styles.queueContent}
              showsVerticalScrollIndicator={false}
            />
          )}
          {/* Botón para borrar toda la cola */}
          <TouchableOpacity style={styles.controlButton} onPress={onClearQueue}>
            <MaterialIcons name="remove-circle-outline" size={24} color="white" />
            <Text style={styles.controlButtonText}>Clear Queue</Text>
          </TouchableOpacity>
          {/*
          // Opcional: botón de refresh
          <TouchableOpacity style={styles.refreshButton} onPress={onReload}>
            <MaterialIcons name="refresh" size={24} color="white" />
            <Text style={styles.controlButtonText}>Refresh Queue</Text>
          </TouchableOpacity>
          */}
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
    maxHeight: 500,
    backgroundColor: '#262626',
    borderRadius: 20,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  skipButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  queueContent: {
    paddingVertical: 10,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  queueImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  queueText: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    display: 'none',
  },
  controlButtonText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
  },
  /* Opcional: 
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  */
});

export default QueueModal;
