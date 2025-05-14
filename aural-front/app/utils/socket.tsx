import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

const HOST =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(HOST, {
      transports: ['websocket'],
      reconnection: true,
      timeout: 5000,
    });
  }
  return socket;
}
