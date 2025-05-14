// app/(tabs)/RadioTab.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useToken } from "../context/TokenContext";
import { useRadio, RadioInfo } from "../utils/useRadio";
import RadioRoomModal from "../components/RadioRoomModal";
import { io, Socket } from "socket.io-client";

export default function RadioTab() {
  const { token } = useToken();
  const userId = token!.user_id;
  const socketRef = useRef<Socket>();

  const {
    radios,
    fetchLiveRadios,
    createRadio,
    deleteRadio,
    joinRadio,
    socket
  } = useRadio();

  const [modalRadio, setModalRadio] = useState<RadioInfo | null>(null);

  useEffect(() => {
    fetchLiveRadios();
  }, []);

  const onCreate = async () => {
  
  if (socket) {
    socket.emit("createRadio", {
      name: `Radio from ${userId}`,
      creatorId: userId,
      playlistId: "X"
    });
    socket.on("radioCreated", (newRadio) => {
      console.log("New radio created: ", newRadio);
      socket.emit("getLiveRadios");
    });
  } else {
    console.error("Socket is undefined. Unable to emit 'createRadio'.");
  }
  };

  const onDelete = (radioId: string, userId: string) => {
    console.log("RadioId: ", radioId, " UserId: ", userId);
    if (!socket) return;

    socket.emit("deleteRadio", {
      userId: userId,
      radioId
    });

    socket.once("radioDeleted", ({ radioId }) => {
      console.log("✅ Radio eliminada:", radioId);
      fetchLiveRadios();
    });

    socket.once("radioError", (err) => {
      console.warn("⚠️ Error al borrar:", err);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createBtn}  onPress={onCreate}>
        <Text style={styles.createText}>+ Nueva Radio</Text>
      </TouchableOpacity>

      <FlatList
        data={radios}
        keyExtractor={(r) => r.radioId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.rowLeft}
              onPress={() => {
                joinRadio(item.radioId, userId);
                setModalRadio(item);
              }}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>
                Creador: {item.creator} — Oyentes: {item.participants.length}
              </Text>
            </TouchableOpacity>

            {/* {item.creator === userId && ( */}
              <TouchableOpacity onPress={() => onDelete(item.radioId, item.creator)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            {/* )} */}
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
