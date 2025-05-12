// app/components/RadioRoomModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert
} from "react-native";
import { RadioInfo, useRadio } from "../utils/useRadio";
import { useToken } from "../context/TokenContext";

interface Props {
  visible: boolean;
  radio: RadioInfo;
  onClose: () => void;
}

export default function RadioRoomModal({ visible, radio, onClose }: Props) {
  const { token } = useToken();
  const userId = token!.user_id;

  const {
    playRadio,
    pauseRadio,
    seekRadio,
    changeSong,
    deleteRadio
  } = useRadio();

  const [seekTime, setSeekTime] = React.useState("0");
  const [newTrack, setNewTrack] = React.useState("");

  const onDelete = () => {
    Alert.alert(
      "Borrar radio",
      `¿Seguro que quieres borrar "${radio.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRadio(radio._id, userId);
              onClose();
            } catch {
              Alert.alert("Error", "No se pudo borrar la radio");
            }
          }
        }
      ]
    );
  };

  const onChangeSong = () => {
    if (!newTrack.trim()) return;
    changeSong(radio._id, userId, { name: newTrack.trim() });
    setNewTrack("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{radio.name}</Text>
            {radio.creator === userId && (
              <TouchableOpacity onPress={onDelete}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Estado actual */}
          <Text style={styles.info}>
            🎵 Ahora: {radio.currentSong?.name ?? "—"}
          </Text>
          <Text style={styles.info}>
            ⏱ Tiempo: {Math.floor(radio.currentTime)}s
          </Text>

          {/* Controles básicos */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => playRadio(radio._id, userId)}>
              <Text style={styles.btn}>▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pauseRadio(radio._id, userId)}>
              <Text style={styles.btn}>⏸️</Text>
            </TouchableOpacity>
          </View>

          {/* Seek */}
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={seekTime}
              onChangeText={setSeekTime}
              placeholder="segundos"
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => seekRadio(radio._id, userId, Number(seekTime))}
            >
              <Text style={styles.smallBtnText}>Mover</Text>
            </TouchableOpacity>
          </View>

          {/* Cambiar canción / Añadir canción */}
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={newTrack}
              onChangeText={setNewTrack}
              placeholder="nombre de la canción"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.smallBtn} onPress={onChangeSong}>
              <Text style={styles.smallBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },
  box: {
    width: width * 0.9,
    backgroundColor: "#262626",
    borderRadius: 8,
    padding: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  close: { color: "white", fontSize: 20 },
  delete: { color: "#F05858", fontSize: 20 },
  title: { color: "#F05858", fontSize: 20, fontWeight: "bold" },
  info: { color: "white", fontSize: 16, marginTop: 12 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24
  },
  btn: { color: "white", fontSize: 32 },
  row: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    padding: 8,
    color: "white",
    marginRight: 8,
    borderRadius: 4
  },
  smallBtn: {
    padding: 10,
    backgroundColor: "#F05858",
    borderRadius: 4
  },
  smallBtnText: { color: "white", fontWeight: "bold" }
});
