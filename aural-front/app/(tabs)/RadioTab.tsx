// app/(tabs)/RadioTab.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useToken } from "../context/TokenContext";
import { useRadio, RadioInfo } from "../utils/useRadio";
import RadioRoomModal from "../components/RadioRoomModal";

export default function RadioTab() {
  const { token } = useToken();
  const userId = token!.user_id;

  const {
    radios,
    fetchLiveRadios,
    createRadio,
    deleteRadio,
    joinRadio
  } = useRadio();

  const [modalRadio, setModalRadio] = useState<RadioInfo | null>(null);

  useEffect(() => {
    fetchLiveRadios();
  }, []);

  const onCreate = async () => {
    const name = `Radio de ${userId}`; // o un prompt para pedir nombre
    try {
      await createRadio(name, userId);
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la radio");
    }
  };

  const onDelete = (r: RadioInfo) => {
    Alert.alert(
      "Borrar radio",
      `¿Seguro que quieres borrar "${r.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRadio(r._id, userId);
            } catch {
              Alert.alert("Error", "No se pudo borrar la radio");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createBtn} onPress={onCreate}>
        <Text style={styles.createText}>+ Nueva Radio</Text>
      </TouchableOpacity>

      <FlatList
        data={radios}
        keyExtractor={(r) => r._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.rowLeft}
              onPress={() => joinRadio(item._id, userId) || setModalRadio(item)}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>
                Creador: {item.creator} — Oyentes: {item.participants.length}
              </Text>
            </TouchableOpacity>

            {item.creator === userId && (
              <TouchableOpacity onPress={() => onDelete(item)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {modalRadio && (
        <RadioRoomModal
          visible={!!modalRadio}
          radio={modalRadio}
          onClose={() => setModalRadio(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  createBtn: {
    backgroundColor: "#F05858",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: "center"
  },
  createText: { color: "white", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#333",
    borderBottomWidth: 1
  },
  rowLeft: { flex: 1 },
  name: { color: "white", fontSize: 18 },
  subtitle: { color: "#aaa", fontSize: 12, marginTop: 4 },
  delete: { fontSize: 20, color: "#F05858", paddingHorizontal: 8 }
});
