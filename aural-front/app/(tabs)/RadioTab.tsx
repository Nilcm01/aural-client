// app/components/RadioTab.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useToken } from "../context/TokenContext";
import { useRadio, RadioInfo } from "../utils/useRadio";
import RadioRoomModal from "../components/RadioRoomModal";
import { useJams, JamInfo } from "../utils/useJams";
import JamRoomModal from "../components/JamRoomModal";

export default function RadioTab() {
  const { token } = useToken();
  const userId = token!.user_id;

  const [mode, setMode] = useState<"radio" | "jams">("radio");
  const [visible, setVisible] = useState(false);

  // Radios
  const {
    radios,
    current,
    fetchLiveRadios,
    createRadio,
    deleteRadio,
    joinRadio,
    leaveRadio,
  } = useRadio();

  // Jams
  const {
    jams,
    currentJam,
    fetchLiveJams,
    createJam,
    deleteJam,
    joinJam,
    addSongToJam,
    leaveJam,
  } = useJams();

  useEffect(() => {
    if (mode === "radio") fetchLiveRadios();
    else fetchLiveJams();
  }, [mode]);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>Selecciona tipo de sesión:</Text>
        <Picker
          selectedValue={mode}
          onValueChange={(value) => setMode(value)}
          dropdownIconColor="white"
          style={styles.picker}
        >
          <Picker.Item label="🎧 Radios" value="radio" />
          <Picker.Item label="🎸 Jams" value="jams" />
        </Picker>
      </View>

      {mode === "radio" ? (
        <>
          <TouchableOpacity style={styles.createBtn} onPress={() => createRadio({ name: `Radio de ${userId}`, creatorId: userId, playlistId: "X" })}>
            <Text style={styles.createText}>+ Nueva Radio</Text>
          </TouchableOpacity>

          <FlatList
            data={radios}
            keyExtractor={(r) => r.radioId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => joinRadio(item.radioId, userId)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <TouchableOpacity onPress={() => deleteRadio(item.radioId, userId)}>
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

          {current && (
            <RadioRoomModal
              visible={true}
              radio={current}
              onClose={() => leaveRadio(current.radioId, userId)}
            />
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={async () => {
              if (!token?.access_token) return;

              const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
                headers: {
                  Authorization: `Bearer ${token.access_token}`,
                },
              });

              const data = await res.json();
              const trackIds = data.items.map((item: any) => item.track.id);

              createJam({
                name: `Jam de ${userId}`,
                creatorId: userId,
                trackIds,
              });
            }}
          >
            <Text style={styles.createText}>+ Nueva Jam</Text>
          </TouchableOpacity>

          <FlatList
            data={jams}
            keyExtractor={(j) => j.jamId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => {
                joinJam(item.jamId, userId);
                setVisible(true);
              }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtitle}>
                  Participantes: <Text style={styles.accent}>{item.participants.length}</Text>
                </Text>
              </TouchableOpacity>
            )}
          />

          {currentJam && visible && (
            <JamRoomModal
              visible={true}
              session={currentJam}
              onClose={() => {
                leaveJam(currentJam.jamId, userId);
                setVisible(false);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 16 },
  listContent: { paddingBottom: 32 },
  dropdownWrapper: { marginBottom: 12 },
  label: { color: "#F05858", marginBottom: 6, fontWeight: "bold", fontSize: 15 },
  picker: {
    backgroundColor: "#1A1A1A",
    color: "white",
    borderRadius: 8,
  },
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
