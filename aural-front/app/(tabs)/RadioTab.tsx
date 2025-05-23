// app/components/RadioTab.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useToken } from "../context/TokenContext";
import { useRadio, RadioInfo } from "../utils/useRadio";
import RadioRoomModal from "../components/RadioRoomModal";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function RadioTab() {
  const { token } = useToken();
  const userId = token!.user_id;

  // ahora también traemos `current` y `leaveRadio`
  const {
    radios,
    current,
    fetchLiveRadios,
    createRadio,
    deleteRadio,
    joinRadio,
    leaveRadio,
  } = useRadio();

  useEffect(() => {
    fetchLiveRadios();
  }, []);

  const onCreate = () => {
    createRadio({
      name: `Radio from ${userId}`,
      creatorId: userId,
      playlistId: "X",
    });
  };

  const onDelete = (radioId: string) => {
    deleteRadio(radioId, userId);
  };

  const onPressItem = (item: RadioInfo) => {
    console.log("[RadioTab] joinRadio()", item.radioId, userId);
    joinRadio(item.radioId, userId);
  };

  return (
    <View style={styles.container}>

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

      <TouchableOpacity style={styles.createBtn} onPress={onCreate}>
        <Text style={styles.createText}>+ Nueva Radio</Text>
      </TouchableOpacity>

      <FlatList
        data={radios}
        keyExtractor={(r) => r.radioId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPressItem(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity onPress={() => onDelete(item.radioId)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Creador: <Text style={styles.accent}>{item.creator}</Text>
            </Text>
            <Text style={styles.subtitle}>
              Oyentes: <Text style={styles.accent}>{item.participants.length}</Text>
            </Text>
          </TouchableOpacity>
        )}
      />

      {/** aquí en vez de `modalRadio` usamos directamente el `current` del hook */}
      {current && (
        <RadioRoomModal
          visible={true}
          radio={current}
          onClose={() => {
            console.log("[RadioTab] leaveRadio()", current.radioId, userId);
            leaveRadio(current.radioId, userId);
          }}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    padding: 0
  },
  listContent: { paddingBottom: 32 },
  createBtn: {
    backgroundColor: "#F05858",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 90,
    marginBottom: 16,
    marginHorizontal: 16,
    alignItems: "center",
  },
  createText: { color: "white", fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: "#1A1A1A",
    borderColor: "#F05858",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    width: width - 32,
    alignSelf: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { color: "#F05858", fontSize: 18, fontWeight: "bold" },
  delete: { fontSize: 20, color: "#F05858" },
  subtitle: { color: "#BBBBBB", fontSize: 14, marginTop: 2 },
  accent: { color: "#F05858", fontWeight: "600" },
});
