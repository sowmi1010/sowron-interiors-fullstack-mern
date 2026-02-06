import { io } from "socket.io-client";

const deriveSocketUrlFromApi = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) return undefined;

  const normalized = apiUrl.replace(/\/+$/, "");
  if (normalized === "/api") return undefined;

  return normalized.endsWith("/api") ? normalized.slice(0, -4) : normalized;
};

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() || deriveSocketUrlFromApi();

const socketOptions = {
  transports: ["websocket"],
  withCredentials: true,
};

export const socket = SOCKET_URL
  ? io(SOCKET_URL, socketOptions)
  : io(socketOptions);
