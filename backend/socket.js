import { Server } from "socket.io";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // frontend URL
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;   // 🔥 same ID as JWT
      socket.role = decoded.role;
      socket.department = decoded.department;

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {

    const {role, department, id} = socket.user;
    console.log("🔌 Socket connected:", socket.id, "User", socket.userId);

    socket.join(role);
    if(department){
      socket.join(department);
    }
    socket.join(id);
    socket.join(`user_${socket.userId}`);

    if (socket.role === "admin") {
      socket.join("admin");
      console.log("🛡 Admin joined room");
    }
    if (socket.role === "staff") {
      socket.join(`staff_${department}`);
      console.log(`👨‍💼 Staff joined: staff_${department}`);
    }

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

