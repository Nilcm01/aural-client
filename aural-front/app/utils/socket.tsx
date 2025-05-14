// app/utils/config.ts

import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

/** Base URL para todas las llamadas REST */
export const API_URL = "https://aural-454910.ew.r.appspot.com/api/items/";

/** Host para Socket.IO: 
 *  - En producción usamos tu dominio GCP  
 *  - En desarrollo local tiramos de localhost/emulador Android
 */
const LOCAL_HOST =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "https://aural-454910.ew.r.appspot.com";

export const SOCKET_HOST =
  process.env.NODE_ENV === "production"
    ? "https://aural-454910.ew.r.appspot.com"
    : LOCAL_HOST;

let socket: Socket;

/** Devuelve un singleton de Socket.IO conectado a SOCKET_HOST */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_HOST, {
      transports: ["websocket"],
      reconnection: true,
      timeout: 5000,
    });
  }
  return socket;
}
