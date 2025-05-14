// app/utils/useRadio.ts
import { useEffect, useState } from "react";
import { getSocket } from "./socket";
import { Socket } from "socket.io-client";

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
    socket.on("liveRadios", (list: RadioInfo[]) => {
      setRadios(list);
    });

    socket.on("radioListUpdated", () => {
      socket.emit("getLiveRadios");
    });

    socket.on("radioCreated", (newRadio: RadioInfo) => {
      setRadios((prev) => [...prev, newRadio]);
    });

    socket.on("radioDeleted", ({ radioId }: { radioId: string }) => {
      setRadios((prev) => prev.filter((r) => r.radioId !== radioId));
      if (current?.radioId === radioId) setCurrent(null);
    });

    // **Aquí recibimos el estado completo al unirnos**
    socket.on(
      "radioJoined",
      (data: RadioInfo & { currentSong: any; currentTime: number }) => {
        console.log("[useRadio] ← radioJoined:", data);
        setCurrent({
          radioId: data.radioId,
          name: data.name,
          creator: data.creator,
          playlistId: data.playlistId,
          participants: data.participants,
          currentSong: data.currentSong,
          currentTime: data.currentTime,
        });
      }
    );

    socket.on(
      "songUpdated",
      (evt: { radioId: string; currentSong: any; currentTime: number }) => {
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
        setCurrent((prev) =>
          prev && prev.radioId === evt.radioId
            ? { ...prev, currentTime: evt.currentTime }
            : prev
        );
      }
    );

    socket.emit("getLiveRadios");

    return () => {
      socket.off("liveRadios");
      socket.off("radioListUpdated");
      socket.off("radioCreated");
      socket.off("radioDeleted");
      socket.off("radioJoined");
      socket.off("songUpdated");
      socket.off("timeSynced");
    };
  }, [socket, current?.radioId]);

  const fetchLiveRadios = () => socket.emit("getLiveRadios");
  const createRadio    = (p: { name: string; creatorId: string; playlistId: string }) =>
    socket.emit("createRadio", p);
  const deleteRadio    = (radioId: string, userId: string) => {
    socket.emit("deleteRadio", { radioId, userId });
    if (current?.radioId === radioId) setCurrent(null);
  };
  const joinRadio      = (radioId: string, userId: string) =>
    socket.emit("joinRadio", radioId, userId);
  const leaveRadio     = (radioId: string, userId: string) => {
    socket.emit("leaveRadio", radioId, userId);
    setCurrent(null);
  };
  const playRadio      = (radioId: string, userId: string) =>
    socket.emit("radioPlay", { radioId, userId });
  const pauseRadio     = (radioId: string, userId: string) =>
    socket.emit("pauseSong", { radioId, userId });
  const seekRadio      = (radioId: string, userId: string, currentTime: number) =>
    socket.emit("syncTime", { radioId, userId, currentTime });
  const changeSong     = (radioId: string, userId: string, song: { id: string; name: string }) =>
    socket.emit("updateSong", { radioId, userId, songId: song.id });

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
