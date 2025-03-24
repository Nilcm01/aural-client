import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function MinimizedSong() {
  return (
    // To be later changed with the song info being played
    <View style={{ display: "flex", flexDirection: "row" , alignItems: "center", zIndex: 1000}}>

        <View  style={{ backgroundColor: "white", height: 50, width: 50, borderRadius: 2}}>
        </ View>
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: 10}}>
            <Text style={{color: "white", fontWeight:"bold", fontSize: 18, margin: 1}}>Song Title </Text>
            <Text style={{color: "#9A9A9A", fontWeight:"bold", fontSize: 14}}> Artist </Text> 
        </View>
    </View>
  );
}