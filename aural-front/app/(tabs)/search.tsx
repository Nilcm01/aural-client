import { View, Text, TextInput } from "react-native";
import React, { useEffect } from "react";
import SearchBar from "../components/searchBar";
import { useReproBarVisibility } from "../components/WebPlayback";
import { useFocusEffect } from "expo-router";

export default function SearchScreen() {
  const { showReproBar } = useReproBarVisibility();
  useFocusEffect(() => {
      showReproBar(true);
      return () => {};
    });
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
