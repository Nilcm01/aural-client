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

interface SongDisplay {
  id: string;
  name: string;
  image?: string;
}

export default function RadioRoomModal({ visible, radio, onClose }: Props) {
  const { token } = useToken();
  const userId = token!.user_id;
  const {
    playRadio,
    pauseRadio,
    seekRadio,
    changeSong,
    deleteRadio,
    leaveRadio,
    socket
  } = useRadio();

  const [seekTime, setSeekTime] = useState("0");
  const [newTrack, setNewTrack] = useState("");

  // Inicializa displaySong protegiendo string o objeto
  const initialSong =
    radio.currentSong == null
      ? null
      : typeof radio.currentSong === "string"
      ? { id: radio.currentSong, name: "" }
      : { id: radio.currentSong.id, name: radio.currentSong.name };

  const [displaySong, setDisplaySong] = useState<SongDisplay | null>(initialSong);
  const [displayTime, setDisplayTime] = useState(radio.currentTime);
  const [isPlaying, setIsPlaying] = useState(false);

  /** — Spotify Web API helpers — */
  const playTrack = async (uri: string, position_ms = 0) => {
    if (!token?.access_token) return Alert.alert("Error", "No Spotify token");
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri], position_ms }),
      });
    } catch (e) {
      console.error("playTrack failed", e);
      Alert.alert("Error", "Play failed");
    }
  };

  const pauseTrack = async () => {
    if (!token?.access_token) return Alert.alert("Error", "No Spotify token");
    try {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
    } catch {
      Alert.alert("Error", "Pause failed");
    }
  };

  const seekTrack = async (ms: number) => {
    if (!token?.access_token) return Alert.alert("Error", "No Spotify token");
    try {
      await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${ms}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
    } catch {
      Alert.alert("Error", "Seek failed");
    }
  };

  /** Incrementa displayTime cada segundo cuando está sonando */
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setDisplayTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  /** Para el creador, al abrir el modal, sincroniza con /me/player */
  useEffect(() => {
    if (!visible || !token?.access_token || userId !== radio.creator) return;
    (async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player?market=ES", {
          headers: { Authorization: `Bearer ${token.access_token}` }
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
          setDisplaySong({
            id: item.id,
            name: item.name,
            image: item.album?.images?.[0]?.url
          });
          const secs = (data.progress_ms ?? 0) / 1000;
          setDisplayTime(secs);
          setIsPlaying(data.is_playing);
          playTrack(`spotify:track:${item.id}`, data.progress_ms);
        }
      } catch (e) {
        console.warn("[Spotify] GET /me/player failed", e);
      }
    })();
  }, [visible, token?.access_token, userId, radio.creator]);

  /** Obtiene carátula y nombre de un track */
  const fetchTrackImage = async (trackId: string) => {
    if (!token?.access_token) return;
    try {
      const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      const info = await res.json();
      setDisplaySong({
        id: info.id,
        name: info.name,
        image: info.album?.images?.[0]?.url
      });
    } catch {
      console.warn("[Spotify] GET /tracks/{id} failed");
    }
  };

  /** — Handlers + WS emits — */

  // Opción B) “sembrar” canción en servidor antes de play
  const handlePlay = () => {
    if (!displaySong) return Alert.alert("Error", "No hay canción elegida");

    // ① Seed currentSong en el servidor
    changeSong(radio.radioId, userId, {
      id: displaySong.id,
      name: displaySong.name
    });
    // ①b Reset time a 0 en servidor
    seekRadio(radio.radioId, userId, 0);

    // ② Arranca localmente y notifica play
    playTrack(`spotify:track:${displaySong.id}`, 0);
    setDisplayTime(0);
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

  const onChangeSong = () => {
    if (!newTrack.trim()) return;
    const fakeId = newTrack.trim().toLowerCase().replace(/\s+/g, "-");
    changeSong(radio.radioId, userId, { id: fakeId, name: newTrack.trim() });
    seekRadio(radio.radioId, userId, 0);
    setNewTrack("");
  };

  const confirmDelete = () => {
    Alert.alert(
      "Borrar radio",
      `¿Seguro que quieres borrar "${radio.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar", style: "destructive", onPress: () => {
            deleteRadio(radio.radioId, userId);
            onClose();
        }}
      ]
    );
  };

  const handleClose = () => {
    leaveRadio(radio.radioId, userId);
    onClose();
  };

  /** WS listeners para mantener todo sincronizado */
  useEffect(() => {
    if (!socket) return;

    const onRadioJoined = (data: { currentSong: string|SongDisplay|null; currentTime: number }) => {
      const song = data.currentSong;
      if (typeof song === "string") {
        setDisplaySong({ id: song, name: "" });
        fetchTrackImage(song);
      } else {
        setDisplaySong(song);
        if (song) fetchTrackImage(song.id);
      }
      setDisplayTime(data.currentTime);
      if (song) playTrack(`spotify:track:${typeof song === "string" ? song : song.id}`, data.currentTime * 1000);
      setIsPlaying(!!song);
    };

    const onSongUpdated = (evt: { currentSong: string|SongDisplay; currentTime: number }) => {
      const song = evt.currentSong;
      if (typeof song === "string") {
        setDisplaySong({ id: song, name: "" });
        fetchTrackImage(song);
      } else {
        setDisplaySong(song);
        fetchTrackImage(song.id);
      }
      setDisplayTime(evt.currentTime);
      playTrack(`spotify:track:${typeof song === "string" ? song : song.id}`, evt.currentTime * 1000);
      setIsPlaying(true);
    };

    const onTimeSynced = ({ currentTime }: any) => {
      setDisplayTime(currentTime);
    };

    socket.on("radioJoined", onRadioJoined);
    socket.on("songUpdated", onSongUpdated);
    socket.on("timeSynced", onTimeSynced);
    socket.on("radioPlay",   () => setIsPlaying(true));
    socket.on("songPaused",  () => setIsPlaying(false));
    socket.on("songResumed", () => setIsPlaying(true));
    socket.on("radioDeleted", ({ radioId }: any) => {
      if (radioId === radio.radioId) onClose();
    });

    return () => {
      socket.off("radioJoined", onRadioJoined);
      socket.off("songUpdated", onSongUpdated);
      socket.off("timeSynced", onTimeSynced);
      socket.off("radioPlay");
      socket.off("songPaused");
      socket.off("songResumed");
      socket.off("radioDeleted");
    };
  }, [socket]);

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

          <View style={styles.row}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={seekTime}
              onChangeText={setSeekTime}
              placeholder="segundos"
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.smallBtn} onPress={() => handleSeek(Number(seekTime))}>
              <Text style={styles.smallBtnText}>Mover</Text>
            </TouchableOpacity>
          </View>

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
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  box:          { width: width * 0.9, backgroundColor: "#262626", borderRadius: 12, padding: 16 },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  close:        { color: "white", fontSize: 20 },
  delete:       { color: "#F05858", fontSize: 20 },
  title:        { color: "#F05858", fontSize: 22, fontWeight: "bold" },
  cover:        { width: width * 0.8, height: width * 0.8, borderRadius: 8, alignSelf: "center", marginVertical: 12, borderWidth: 2, borderColor: "#F05858" },
  info:         { color: "white", fontSize: 16, marginBottom: 8, textAlign: "center" },
  controls:     { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
  btn:          { color: "white", fontSize: 32 },
  row:          { flexDirection: "row", marginTop: 16, alignItems: "center" },
  input:        { flex: 1, borderWidth: 1, borderColor: "#444", padding: 8, color: "white", marginRight: 8, borderRadius: 4 },
  smallBtn:     { padding: 10, backgroundColor: "#F05858", borderRadius: 4 },
  smallBtnText: { color: "white", fontWeight: "bold" },
});
