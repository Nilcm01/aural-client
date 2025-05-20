import { useState } from "react";
import { getSocket } from "./socket";
import type { Socket } from "socket.io-client";

export interface JamInfo {
    jamId: string;
    name: string;
    creator: string;
    participants: string[];
    playlist: string[];
    currentTrack?: { id: string; name: string };
    currentTime: number;
}

export function useJams() {
    const socket: Socket = getSocket();
    const [jams, setJams] = useState<JamInfo[]>([]);
    const [current, setCurrent] = useState<JamInfo | null>(null);


    // ---- APIs hacia el servidor ----
    const fetchLiveJams = () => { socket.emit("getJams", null, (data: JamInfo[]) => setJams(data));};

    const createJam = (jam: { name: string; creatorId: string; trackIds: string[] }) => {
        socket?.emit("createJam", jam, (res: JamInfo) => {
            setCurrent(res);
            fetchLiveJams();
        });
    };

    const joinJam = (jamId: string, userId: string) => {
        socket?.emit("joinJam", { jamId, userId }, (res: JamInfo) => {
            setCurrent(res);
            fetchLiveJams();
        });
    };

    const addSongToJam = (jamId: string, songId: string) => {
        socket?.emit("addSongToJam", { jamId, songId }, (updated: JamInfo) => {
            setCurrent(updated);
            fetchLiveJams();
        });
    };

    const leaveJam = (jamId: string, userId: string) => {
        socket?.emit("leaveJam", { jamId, userId });
        setCurrent(null);
    };

    const deleteJam = (jamId: string, userId: string) => {
        socket?.emit("deleteJam", { jamId, userId }, () => fetchLiveJams());
    };

    return {
        jams,
        currentJam: current,
        fetchLiveJams,
        createJam,
        joinJam,
        addSongToJam,
        leaveJam,
        deleteJam,
    };
}
