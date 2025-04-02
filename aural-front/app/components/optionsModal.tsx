// components/optionsModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onViewPublications: () => void;
  onPublish: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({ visible, onClose, onViewPublications, onPublish }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose an action</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              console.log('View Publications pressed');
              onViewPublications();
              // Puedes dejar onClose() aquí o llamarlo dentro de onViewPublications en el padre
            }}
          >
            <Text style={styles.modalButtonText}>View Publications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              onPublish();
              // Igual, opcional llamar a onClose() aquí o en el padre
            }}
          >
            <Text style={styles.modalButtonText}>Publish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
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
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    color: '#f05858',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#f05858',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default OptionsModal;
