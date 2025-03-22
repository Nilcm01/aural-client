import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function AppBar() {
  return (
    <View className="app-bar" style={{ height: 80, backgroundColor: "#2A496B", 
      alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between",

    }}>
       {/* To be later replaced dynamic title */} 
      <Text style={{color: "white", fontWeight:"bold", fontSize: 12}}> HOME </Text>
      <MaterialIcons name="person" size={30} color="white" style={{left: 0}}></MaterialIcons>
    </View>
  );
}