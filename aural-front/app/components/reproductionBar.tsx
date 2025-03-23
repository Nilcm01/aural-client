import { Text, View, Button, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function ReproductionBar() {
  return (
    <View className="reproduction-bar" style={styles.line} />
    // ToDo: add progression line in sync with the song 
  );
}

const styles = StyleSheet.create({
    line: {
      width: '100%', 
      height: 4, 
      backgroundColor: '#9A9A9A', 
      position: 'absolute',
      zIndex: 10,
      bottom: 70
    },
});