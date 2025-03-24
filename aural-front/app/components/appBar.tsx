import { Text, View, Button, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function AppBar() {
  return (
    <View className="app-bar" style={{ height: 80, backgroundColor: "#262626", 
      alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
    }}>
       {/* To be later replaced dynamic title */} 
      <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20 }}> Home </Text>
      <Pressable onPress={() => {}} style={{backgroundColor: "#262626", padding: 4, borderRadius: 4, margin: 2, alignItems: "center", justifyContent: "center"}}>
        <MaterialIcons name="person" size={30} color="white" style={{left: 0}} />
      </Pressable>
    </View>
  );
}