// components/publishModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ visible, onClose, onSubmit }) => {
  const [localText, setLocalText] = useState<string>('');

  useEffect(() => {
    if (!visible) {
      setLocalText('');
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Publish a new post</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write your publication here..."
            placeholderTextColor="#aaa"
            value={localText}
            onChangeText={setLocalText}
            multiline
          />
          <TouchableOpacity style={styles.modalButton} onPress={() => onSubmit(localText)}>
            <Text style={styles.modalButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
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
  textInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#141218',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: 'white',
    marginBottom: 15,
    textAlignVertical: 'top',
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

export default PublishModal;
