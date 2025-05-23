import { Text, View } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { useRouter } from "expo-router";
import { useToken } from "../context/TokenContext";

export default function AppBar() {
  const { token, logout } = useToken();
  const router = useRouter();

  return (
    <View style={{
      height: 80, backgroundColor: "#262626",
      alignItems: "center", top: 0, position: "absolute", width: "100%", display: "flex", flexDirection: "row", paddingHorizontal: 30, justifyContent: "space-between", zIndex: 10
    }}>
      {/* To be later replaced dynamic title */}
      <Text style={{ color: "#F05858", fontWeight: "bold", fontSize: 20 }}> Home </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "#F05858", fontWeight: "regular", fontStyle: "italic", fontSize: 12, marginRight: 10 }}>
          {token ? `${token.user_id}` : "No Token"}
        </Text>
        <MaterialIcons
          name={token ? "person" : "login"} // Show "person" if token exists, otherwise "login"
          size={30}
          color="white"
          onPress={() => {
            if (token) {
              router.push("/profileScreen");
            } else {
              router.push("/loginScreen"); // Navigate to login screen
            }
          }}
        />
        <Ionicons
          name="people-circle-outline"
          size={30}
          color="white"
          onPress={() => {
            if (token) {
              router.push("/FriendsScreen");
            } else {
              router.push("/loginScreen"); // Navigate to login screen
            }
          }}
        />
      </View>
    </View>
  );
}