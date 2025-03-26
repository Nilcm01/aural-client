// components/CustomFeedButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, AccessibilityState } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FooterBarButton } from './footerBar';

interface CustomFeedButtonProps {
  onPress: () => void;
  accessibilityState?: AccessibilityState & { selected?: boolean };
}

const CustomFeedButton: React.FC<CustomFeedButtonProps> = ({ onPress, accessibilityState }) => {
  const focused = accessibilityState?.selected ?? false;
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <MaterialIcons name="library-books" size={30} color={focused ? "white" : "#9A9A9A"} />
      <FooterBarButton title="Feed" onPress={() => {}} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default CustomFeedButton;
