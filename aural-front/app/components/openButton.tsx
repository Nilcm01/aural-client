// components/openButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OpenButtonProps {
  onPress: () => void;
}

const OpenButton: React.FC<OpenButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.openButton} onPress={onPress}>
      <Text style={styles.openButtonText}>Simple Publications</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  openButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 8,
  },
  openButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OpenButton;
