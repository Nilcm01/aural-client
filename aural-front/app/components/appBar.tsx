import { Text, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useRouter } from "expo-router";
import { useToken } from "../context/TokenContext";

export default function AppBar() {
  const { token } = useToken();
  const router = useRouter();

  return (
    <View className="app-bar" style={{
      height: 80, backgroundColor: "#262626",
      alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
    }}>
      {/* To be later replaced dynamic title */}
      <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}> Home </Text>
      <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}>
        {token ? token.expires : "No Token"}
        <MaterialIcons
          name="person"
          size={30}
          color="white"
          style={{ left: 0 }}
          onPress={() => router.push("/loginScreen")} // Navigate to loginScreen
        />
      </Text>
    </View>
  );
}