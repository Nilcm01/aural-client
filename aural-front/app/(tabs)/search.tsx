import { View, Text, TextInput } from "react-native";
import React from "react";
import SearchBar from "../components/searchBar";

export default function SearchScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#262626",
      }}
    >
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
      }}>
        
        <SearchBar />
      </View>
    </View>
  );
}
