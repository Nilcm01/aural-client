// app/components/RadioRoomModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert
} from "react-native";
import { RadioInfo, useRadio } from "../utils/useRadio";
import { useToken } from "../context/TokenContext";

interface Props {
  visible: boolean;
  radio: RadioInfo;
  onClose: () => void;
}

interface SongDisplay {
  id: string;
  name: string;
  image?: string;
}

export default function RadioRoomModal({ visible, radio, onClose }: Props) {
  // 1) Aseguramos contexto y token
  const tokenContext = useToken();
  if (!tokenContext) return null;
  const { token } = tokenContext;
  if (!token) return null;

  const userId = token.user_id;
  const {
    playRadio,
    pauseRadio,
    seekRadio,
    changeSong,
    deleteRadio,
    leaveRadio,
    socket
  } = useRadio();

  const [displaySong, setDisplaySong] = useState<SongDisplay | null>(
    radio.currentSong
      ? { id: radio.currentSong.id, name: radio.currentSong.name }
      : null
  );
  const [displayTime, setDisplayTime] = useState(radio.currentTime);
  const [isPlaying, setIsPlaying] = useState(false);

  /** Helpers Spotify API **/
  const playTrack = async (uri: string, position_ms = 0) => {
    if (!token.access_token) return;
    await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [uri], position_ms }),
    });
  };
  const pauseTrack = async () => {
    if (!token.access_token) return;
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
  };
  const seekTrack = async (ms: number) => {
    if (!token.access_token) return;
    await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${ms}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
  };

  // UI timer
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => setDisplayTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [isPlaying]);

  // CREATOR: al abrir, sincroniza desde Spotify Web API
  useEffect(() => {
    if (!visible || userId !== radio.creator || !token.access_token) return;
    (async () => {
      const res = await fetch("https://api.spotify.com/v1/me/player?market=ES", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (res.status === 204) {
        setDisplaySong(null);
        setDisplayTime(0);
        setIsPlaying(false);
        return;
      }
      const data = await res.json();
      const item = data.item;
      if (item) {
        const secs = (data.progress_ms ?? 0) / 1000;
        setDisplaySong({
          id: item.id,
          name: item.name,
          image: item.album?.images?.[0]?.url,
        });
        setDisplayTime(secs);
        setIsPlaying(data.is_playing);
        await playTrack(`spotify:track:${item.id}`, data.progress_ms);
      }
    })();
  }, [visible, token.access_token, userId, radio.creator]);

  // LISTENER (no-creator): al abrir si ya hay currentSong, arranca y trae portada
  useEffect(() => {
    if (!visible || userId === radio.creator) return;
    if (radio.currentSong) {
      const { id, name } = radio.currentSong;
      setDisplaySong({ id, name });
      setDisplayTime(radio.currentTime);
      playTrack(`spotify:track:${id}`, radio.currentTime * 1000);
      // fetch portada y nombre
      fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
        .then(r => r.json())
        .then(info => {
          const imageUrl = info.album?.images?.[0]?.url;
          const realName = info.name ?? name;
          setDisplaySong({ id, name: realName, image: imageUrl });
        })
        .catch(() => {});
      setIsPlaying(true);
    }
  }, [visible, radio.currentSong, radio.currentTime, userId, token.access_token]);

  /** Handlers UI **/
  const handlePlay = () => {
    if (!displaySong) return Alert.alert("Error", "No hay canción elegida");
    changeSong(radio.radioId, userId, {
      id: displaySong.id,
      name: displaySong.name,
    });
    playTrack(`spotify:track:${displaySong.id}`, displayTime * 1000);
    setIsPlaying(true);
    playRadio(radio.radioId, userId);
  };
  const handlePause = () => {
    pauseTrack();
    setIsPlaying(false);
    pauseRadio(radio.radioId, userId);
  };
  const handleSeek = (secs: number) => {
    seekTrack(secs * 1000);
    setDisplayTime(secs);
    seekRadio(radio.radioId, userId, secs);
  };
  const handleSetCurrent = async () => {
    if (userId !== radio.creator || !token.access_token) return;
    const res = await fetch("https://api.spotify.com/v1/me/player?market=ES", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (res.status === 204) return Alert.alert("Error", "Nada sonando");
    const data = await res.json();
    const item = data.item;
    if (!item) return Alert.alert("Error", "Nada sonando");

    const secs = (data.progress_ms ?? 0) / 1000;
    const imageUrl = item.album?.images?.[0]?.url;
    setDisplaySong({ id: item.id, name: item.name, image: imageUrl });
    setDisplayTime(secs);

    changeSong(radio.radioId, userId, {
      id: item.id,
      name: item.name,
    });
    seekRadio(radio.radioId, userId, secs);
    Alert.alert("✅", "Asignada a todos");
  };

  const confirmDelete = () =>
    Alert.alert(
      "Borrar radio",
      `¿Borrar "${radio.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            deleteRadio(radio.radioId, userId);
            onClose();
          },
        },
      ]
    );
  const handleClose = () => {
    leaveRadio(radio.radioId, userId);
    onClose();
  };

  // WS listeners (songUpdated + time sync + pausa/resume + delete)
  useEffect(() => {
    if (!socket) return;

    const onRec = (d: any) => {
      const raw = d.currentSong;
      const songId = typeof raw === "string" ? raw : raw.id;
      const songName = typeof raw === "string" ? "" : raw.name;

      setDisplayTime(d.currentTime);
      playTrack(`spotify:track:${songId}`, d.currentTime * 1000);
      setIsPlaying(true);

      fetch(`https://api.spotify.com/v1/tracks/${songId}`, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
        .then(r => r.json())
        .then(info => {
          const imageUrl = info.album?.images?.[0]?.url;
          const realName = info.name ?? songName;
          setDisplaySong({ id: songId, name: realName, image: imageUrl });
        })
        .catch(() => {
          setDisplaySong({ id: songId, name: songName });
        });
    };

    socket.on("songUpdated", onRec);
    socket.on("timeSynced", ({ currentTime }: any) => setDisplayTime(currentTime));
    socket.on("songPaused", () => setIsPlaying(false));
    socket.on("songResumed", () => setIsPlaying(true));
    socket.on("radioDeleted", ({ radioId }: any) => {
      if (radioId === radio.radioId) onClose();
    });

    return () => {
      socket.off("songUpdated", onRec);
      socket.off("timeSynced");
      socket.off("songPaused");
      socket.off("songResumed");
      socket.off("radioDeleted");
    };
  }, [socket, radio.radioId, token.access_token, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{radio.name}</Text>
            {radio.creator === userId && (
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>

          {displaySong?.image && (
            <Image source={{ uri: displaySong.image }} style={styles.cover} />
          )}
          <Text style={styles.info}>🎵 Ahora: {displaySong?.name ?? "—"}</Text>
          <Text style={styles.info}>⏱ Tiempo: {Math.floor(displayTime)}s</Text>

          <View style={styles.controls}>
            <TouchableOpacity onPress={handlePlay}>
              <Text style={styles.btn}>▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePause}>
              <Text style={styles.btn}>⏸️</Text>
            </TouchableOpacity>
          </View>

          {radio.creator === userId && displaySong && (
            <TouchableOpacity style={styles.setBtn} onPress={handleSetCurrent}>
              <Text style={styles.setBtnText}>Asignar actual</Text>
            </TouchableOpacity>
          )}

          {/* Se han eliminado los controles de Mover y Enviar aquí */}
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
    alignItems: "center",
  },
  box: {
    width: width * 0.9,
    backgroundColor: "#262626",
    borderRadius: 12,
    padding: 16,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  close: { color: "white", fontSize: 20 },
  delete: { color: "#F05858", fontSize: 20 },
  title: { color: "#F05858", fontSize: 22, fontWeight: "bold" },
  cover: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 12,
    borderWidth: 2,
    borderColor: "#F05858",
  },
  info: { color: "white", fontSize: 16, marginBottom: 8, textAlign: "center" },
  controls: { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
  btn: { color: "white", fontSize: 32 },
  setBtn: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#1DB954",
    borderRadius: 4,
    alignSelf: "center",
  },
  setBtnText: { color: "white", fontWeight: "bold" },
});
