import { Text, View, Button, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function ReproductionBar() {
  return (
    <View className="reproduction-bar" style={styles.line} >
        {/* ToDo: add progression line in sync with the song  */}
        <View className="reproductionprogress-bar" style={styles.lineProgress} />
    </View> 
  );
}

const styles = StyleSheet.create({
    line: {
      width: '100%', 
      height: 4, 
      backgroundColor: '#9A9A9A', 
      position: 'absolute',
      zIndex: 1000,
      bottom: 70,
    },
    lineProgress:{
      width: '50%', // ToDo: change width to the current song progression
      height: 4, 
      backgroundColor: '#F05858', 
      position: 'absolute',
      zIndex: 10,
      left: 0
    }
});