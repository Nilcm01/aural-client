// app/utils/useRadio.ts
import { useEffect, useState } from "react";
import { getSocket } from "./socket";
import type { Socket } from "socket.io-client";

export interface RadioInfo {
  radioId: string;
  name: string;
  creator: string;
  playlistId?: string;
  participants: { userId: string; admin?: boolean }[];
  currentSong: { id: string; name: string } | null;
  currentTime: number;
}

export function useRadio() {
  const [radios, setRadios] = useState<RadioInfo[]>([]);
  const [current, setCurrent] = useState<RadioInfo | null>(null);
  const socket: Socket = getSocket();

  useEffect(() => {
    // 1) Recibo lista completa de radios
    socket.on("liveRadios", (list: RadioInfo[]) => {
      console.log("[useRadio] ← liveRadios", list);
      setRadios(list);
    });

    // 2) Creación / borrado de radios
    socket.on("radioCreated", (r: RadioInfo) => {
      console.log("[useRadio] ← radioCreated", r);
      setRadios((prev) => [...prev, r]);
    });
    socket.on("radioDeleted", ({ radioId }: { radioId: string }) => {
      console.log("[useRadio] ← radioDeleted", radioId);
      setRadios((prev) => prev.filter((r) => r.radioId !== radioId));
      if (current?.radioId === radioId) setCurrent(null);
    });

    // 3) Al unirnos, recibimos sólo { radioId, participants, currentSong, currentTime },
    //    así que hay que rescatar name & creator de nuestro array local
    socket.on(
      "radioJoined",
      (data: {
        radioId: string;
        participants: { userId: string; admin?: boolean }[];
        currentSong: any;
        currentTime: number;
      }) => {
        console.log("[useRadio] ← radioJoined", data);
        const existing = radios.find((r) => r.radioId === data.radioId);
        setCurrent({
          radioId: data.radioId,
          // si no la encuentro, pongo valores por defecto
          name:      existing?.name       ?? "Unknown radio",
          creator:   existing?.creator    ?? "",
          playlistId: existing?.playlistId,
          participants: data.participants,
          currentSong:  data.currentSong,
          currentTime:  data.currentTime,
        });
      }
    );

    // 4) Listeners de actualizaciones parciales
    socket.on(
      "songUpdated",
      (evt: { radioId: string; currentSong: any; currentTime: number }) => {
        console.log("[useRadio] ← songUpdated", evt);
        setCurrent((prev) =>
          prev && prev.radioId === evt.radioId
            ? { ...prev, currentSong: evt.currentSong, currentTime: evt.currentTime }
            : prev
        );
      }
    );
    socket.on(
      "timeSynced",
      (evt: { radioId: string; currentTime: number }) => {
        console.log("[useRadio] ← timeSynced", evt);
        setCurrent((prev) =>
          prev && prev.radioId === evt.radioId
            ? { ...prev, currentTime: evt.currentTime }
            : prev
        );
      }
    );

    // 5) Pido la lista al arrancar
    socket.emit("getLiveRadios");

    return () => {
      socket.off("liveRadios");
      socket.off("radioCreated");
      socket.off("radioDeleted");
      socket.off("radioJoined");
      socket.off("songUpdated");
      socket.off("timeSynced");
    };
  }, [socket, radios, current?.radioId]);

  // ---- APIs hacia el servidor ----
  const fetchLiveRadios = () => socket.emit("getLiveRadios");

  const createRadio = (p: {
    name: string;
    creatorId: string;
    playlistId: string;
  }) => socket.emit("createRadio", p);

  const deleteRadio = (radioId: string, userId: string) => {
    socket.emit("deleteRadio", { radioId, userId });
    if (current?.radioId === radioId) setCurrent(null);
  };

  const joinRadio = (radioId: string, userId: string) =>
    socket.emit("joinRadio", radioId, userId);

  const leaveRadio = (radioId: string, userId: string) => {
    socket.emit("leaveRadio", radioId, userId);
    setCurrent(null);
  };

  const playRadio = (radioId: string, userId: string) =>
    socket.emit("radioPlay", { radioId, userId });

  const pauseRadio = (radioId: string, userId: string) =>
    socket.emit("pauseSong", { radioId, userId });

  const seekRadio = (
    radioId: string,
    userId: string,
    currentTime: number
  ) => socket.emit("syncTime", { radioId, userId, currentTime });

  const changeSong = (
    radioId: string,
    userId: string,
    song: { id: string; name: string }
  ) => socket.emit("updateSong", { radioId, userId, songId: song.id });

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
