import { useEffect, useState } from "react";
import axios from "axios";
import { Platform } from "react-native";
import { getSocket } from "./socket";
import { Socket } from "socket.io-client";

export interface RadioInfo {
  radioId: string;
  name: string;
  creator: string;
  participants: { userId: string; admin: boolean }[];
  currentSong: any;
  currentTime: number;
}

const HOST =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";

const REST = `${HOST}/api/items`;

export function useRadio() {
  const [radios, setRadios] = useState<RadioInfo[]>([]);
  const [current, setCurrent] = useState<RadioInfo | null>(null);
  const socket = getSocket();

  /** 1) Carga la lista de radios “en directo” */
  function fetchLiveRadios() {
    socket.emit("getLiveRadios");
  }

  /** 2) Crea una radio nueva (name + creatorId) */
  async function createRadio(name: string, creatorId: string): Promise<string> {
    const { data } = await axios.post<{ radioId: string }>(
      `${REST}/create-radio`,
      { name, creatorId }
    );
    fetchLiveRadios();
    return data.radioId;
  }

  /** 3) Borra una radio (solo su creador) */
  async function deleteRadio(radioId: string, userId: string) {
    await axios.delete(`${REST}/delete-radio`, {
      data: { radioId, userId },
    });
    fetchLiveRadios();

    if (current?.radioId === radioId) {
      socket.emit("leaveRadio", radioId, userId);
      setCurrent(null);
    }
  }

  /** 4) Únete a una radio via WS */
  function joinRadio(radioId: string, userId: string) {
    socket.emit("joinRadio", radioId, userId);
    const found = radios.find((r) => r.radioId === radioId) ?? null;
    setCurrent(found);
  }

  /** 5) Sal de una radio via WS */
  function leaveRadio(radioId: string, userId: string) {
    socket.emit("leaveRadio", radioId, userId);
    setCurrent(null);
  }

  /** 6) Controles de reproducción (solo el creador) */
  function playRadio(radioId: string, userId: string) {
    socket.emit("radioPlay", { radioId, userId });
  }
  function pauseRadio(radioId: string, userId: string) {
    socket.emit("radioPause", { radioId, userId });
  }
  function seekRadio(radioId: string, userId: string, time: number) {
    socket.emit("radioSeek", { radioId, userId, time });
  }
  function changeSong(radioId: string, userId: string, song: any) {
    socket.emit("radioChangeSong", { radioId, userId, song });
  }

  /** 7) Listeners WebSocket (solo una vez) */
  useEffect(() => {
    socket.on("liveRadios", (radios) => {
      console.log("Live radios recibidas:", radios);
      setRadios(radios);
      console.log("Radios after setter: ", radios);
    });

    socket.on("radioState", (state: { currentSong: any; currentTime: number }) => {
      setCurrent((prev) => (prev ? { ...prev, ...state } : prev));
    });

    socket.on("radioJoined", (data) => {
      setCurrent((prev) => (prev ? { ...prev, ...data } : prev));
    });

    socket.on("radioError", (err) => {
      console.warn("Socket radio error:", err);
    });

    socket.emit("getLiveRadios");

    return () => {
      // No desconectes aquí si quieres que sea singleton global
      // socket.off(...) si necesitas limpiar listeners específicos
    };
  }, []);

  return {
    radios,
    current,
    fetchLiveRadios,
    createRadio,
    deleteRadio,
    joinRadio,
    leaveRadio,
    playRadio,
    pauseRadio,
    seekRadio,
    changeSong,
    socket,
  };
}
