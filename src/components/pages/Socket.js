import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!token) return;

  socket = io(`${process.env.BACKEND_URL}`, {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
