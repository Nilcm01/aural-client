import { Text, View, Button } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeMenu() {
  return (
    <View className="home-menu" >
       {/* To be later replaced dynamic sections */} 
       <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", margin: 10}}>  
        <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20}}> Recents </Text>
        <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20}}> New Releases </Text>
        <Text style={{color: "#F05858", fontWeight:"bold", fontSize: 20}}> Created for you </Text>
       </View>
    </View>
  );
}