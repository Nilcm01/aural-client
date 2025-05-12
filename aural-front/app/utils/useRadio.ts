// app/utils/useRadio.ts
import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { Platform } from "react-native";

export interface RadioInfo {
  _id: string;
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
const WS = HOST;

export function useRadio() {
  const [radios, setRadios] = useState<RadioInfo[]>([]);
  const [current, setCurrent] = useState<RadioInfo | null>(null);
  const socketRef = useRef<Socket>();

  /** 1) Carga la lista de radios “en directo” */
  async function fetchLiveRadios() {
    const res = await axios.get<{ radios: RadioInfo[] }>(
      `${REST}/live-radios`
    );
    setRadios(res.data.radios);
  }

  /** 2) Crea una radio nueva (name + creatorId) */
  async function createRadio(
    name: string,
    creatorId: string
  ): Promise<string> {
    const { data } = await axios.post<{ radioId: string }>(
      `${REST}/create-radio`,
      { name, creatorId }
    );
    await fetchLiveRadios();
    return data.radioId;
  }

  /** 3) Borra una radio (solo su creador) */
  async function deleteRadio(radioId: string, userId: string) {
    await axios.delete(`${REST}/delete-radio`, {
      data: { radioId, userId },
    });
    await fetchLiveRadios();

    // Si estabas dentro de esa radio, la abandonas
    if (current?._id === radioId) {
      socketRef.current?.emit("leaveRadio", radioId, userId);
      setCurrent(null);
    }
  }

  /** 4) Únete a una radio via WS */
  function joinRadio(radioId: string, userId: string) {
    socketRef.current?.emit("joinRadio", radioId, userId);
    const found = radios.find((r) => r._id === radioId) ?? null;
    setCurrent(found);
  }

  /** 5) Sal de una radio via WS */
  function leaveRadio(radioId: string, userId: string) {
    socketRef.current?.emit("leaveRadio", radioId, userId);
    setCurrent(null);
  }

  /** 6) Controles de reproducción (solo el creador) */
  function playRadio(radioId: string, userId: string) {
    socketRef.current?.emit("radioPlay", { radioId, userId });
  }
  function pauseRadio(radioId: string, userId: string) {
    socketRef.current?.emit("radioPause", { radioId, userId });
  }
  function seekRadio(radioId: string, userId: string, time: number) {
    socketRef.current?.emit("radioSeek", { radioId, userId, time });
  }
  function changeSong(radioId: string, userId: string, song: any) {
    socketRef.current?.emit("radioChangeSong", { radioId, userId, song });
  }

  /** 7) Inicializa WS y listeners */
  useEffect(() => {
    const sock = io(WS);
    socketRef.current = sock;

    sock.on("liveRadios", setRadios);
    sock.on(
      "radioState",
      (state: { currentSong: any; currentTime: number }) => {
        if (current) {
          setCurrent({ ...current, ...state });
        }
      }
    );
    sock.on("radioError", console.warn);

    sock.emit("getLiveRadios");

    return () => {
      sock.disconnect();
    };
  }, [current]);

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
  };
}
