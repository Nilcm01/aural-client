// components/PublicationsModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

interface Publication {
  id: string;
  text: string;
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
    console.log("PublicationsModal rendered, visible:", visible);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Publications Feed</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
            <Text style={styles.reloadButtonText}>Reload Feed</Text>
          </TouchableOpacity>
          <FlatList
            data={publications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.publicationItem}>
                <Text style={styles.publicationText}>{item.text}</Text>
              </View>
            )}
          />
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
    maxWidth: 500,
    height: '80%',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  publicationItem: {
    backgroundColor: '#141218',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    marginBottom: 10,
  },
  publicationText: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#f05858',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default PublicationsModal;
