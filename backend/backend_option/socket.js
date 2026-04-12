// import { Server } from "socket.io";
// import express from "express";
// import http from "http";
// import jwt from "jsonwebtoken";

// const app = express();
// const server = http.createServer(app);

// export const initSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173", // frontend URL
//       credentials: true
//     }
//   });

//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) return next(new Error("No token"));

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       socket.userId = decoded.id || decoded.userId;   // 🔥 same ID as JWT
//       socket.role = decoded.role;
//       socket.department = decoded.department || null;

//       next();
//     } catch (err) {
//       next(new Error("Authentication failed"));
//     }
//   });

//   socket.on("account_unblocked", (data) => {
//   alert(data?.message || "Your account has been unblocked. Please login again.");
// });
// io.to("admin").emit("notification", {
//   type: "info",
//   message: `SLA updated for ${rule.severity} severity`,
// });

// io.to("staff").emit("notification", {
//   type: "info",
//   message: `SLA updated for ${rule.severity} severity`,
// });

//   // io.on("connection", (socket) => {

//   //   const {role, department, id} = socket.user;
//   //   console.log("🔌 Socket connected:", socket.id, "User", socket.userId);

//   //   socket.join(role);
//   //   if(department){
//   //     socket.join(department);
//   //   }
//   //   socket.join(id);
//   //   socket.join(`user_${socket.userId}`);

//   //   if (socket.role === "admin") {
//   //     socket.join("admin");
//   //     console.log("🛡 Admin joined room");
//   //   }
//   //   if (socket.role === "staff") {
//   //     socket.join(`staff_${department}`);
//   //     console.log(`👨‍💼 Staff joined: staff_${department}`);
//   //   }

//   //   socket.on("disconnect", () => {
//   //     console.log("❌ Socket disconnected:", socket.id);
//   //   });
//   // });

//     io.on("connection", (socket) => {
//     console.log("🔌 Socket connected:", socket.id, "userId:", socket.userId);

//     // ✅ user room (for force logout, personal notifications)
//     socket.join(`user:${socket.userId}`);

//     // ✅ role room
//     if (socket.role) socket.join(`role:${socket.role}`);

//     // ✅ department room (optional)
//     if (socket.department) socket.join(`dept:${socket.department}`);

//     socket.on("disconnect", () => {
//       console.log("❌ Socket disconnected:", socket.id);
//     });
//   });
  
//   return io;
// };


import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.join(String(socket.user.id || socket.user._id));

    if (socket.user.role) socket.join(socket.user.role);
    if (socket.user.department) socket.join(`dept:${socket.user.department}`);

    socket.on("join_room", ({ role }) => {
      if (role) socket.join(role);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};