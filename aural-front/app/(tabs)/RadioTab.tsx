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
  container: { flex: 1, backgroundColor: "#121212", padding: 16 },
  listContent: { paddingBottom: 32 },
  createBtn: {
    backgroundColor: "#F05858",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
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
