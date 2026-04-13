// import { io } from "socket.io-client";
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   motion,
//   AnimatePresence,
//   useMotionValue,
//   useTransform,
//   useSpring,
// } from "framer-motion";
// import {
//   Ticket,
//   PlusCircle,
//   Bell,
//   LayoutDashboard,
//   Sparkles,
//   User,
//   LogOut,
//   Layers
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";

// // Sub-components (Preserved imports)
// import RaiseTicket from "./RaiseTicket";
// import MyTickets from "./MyTickets";
// import Notifications from "./Notifications";
// import UserProfile from "./UserProfile";

// /* ---------------- 3D UTILITIES ---------------- */

// const TiltCard = ({ children, className = "" }) => {
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
//   const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

//   const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
//   const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

//   const handleMouseMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const width = rect.width;
//     const height = rect.height;
//     const mouseXFromCenter = e.clientX - rect.left - width / 2;
//     const mouseYFromCenter = e.clientY - rect.top - height / 2;
//     x.set(mouseXFromCenter / width);
//     y.set(mouseYFromCenter / height);
//   };

//   const handleMouseLeave = () => {
//     x.set(0);
//     y.set(0);
//   };

//   return (
//     <motion.div
//       style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       className={`relative transition-all duration-200 ease-out ${className}`}
//     >
//       {children}
//     </motion.div>
//   );
// };

// /* ---------------- 3D BACKGROUND ---------------- */
// const AnimatedBackground3D = () => {
//   return (
//     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50">
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 2 }}
//         className="absolute inset-0"
//         style={{ perspective: "1000px" }}
//       >
//         {/* Floating Orb 1 */}
//         <motion.div
//           animate={{
//             rotateX: [0, 20, 0],
//             rotateY: [0, 30, 0],
//             y: [0, -40, 0],
//             scale: [1, 1.1, 1],
//           }}
//           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl mix-blend-multiply"
//           style={{ transformStyle: "preserve-3d", translateZ: -100 }}
//         />

//         {/* Floating Orb 2 */}
//         <motion.div
//           animate={{
//             rotateX: [0, -20, 0],
//             rotateY: [0, -30, 0],
//             x: [0, 50, 0],
//             scale: [1, 1.2, 1],
//           }}
//           transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 blur-3xl mix-blend-multiply"
//           style={{ transformStyle: "preserve-3d", translateZ: -50 }}
//         />
//       </motion.div>
//     </div>
//   );
// };

// /* ---------------- MAIN DASHBOARD ---------------- */
// export default function UserDashboard() {
//   const { user, logout } = useAuth();
//   const [tab, setTab] = useState("tickets");
//   const [tickets, setTickets] = useState([]); // Kept for logic preservation
//   const navigate = useNavigate();

//   const tabs = [
//     { id: "tickets", label: "My Tickets", icon: Ticket, color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
//     { id: "raise", label: "Raise Ticket", icon: PlusCircle, color: "bg-indigo-500", gradient: "from-indigo-500 to-indigo-600" },
//     { id: "notifications", label: "Notifications", icon: Bell, color: "bg-amber-500", gradient: "from-amber-500 to-amber-600" },
//     { id: "profile", label: "Profile", icon: User, color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
//   ];

//   /* --------- LOGIC: AUTH & SOCKET --------- */
//   const handleLogout = () => {
//     logout();
//     setTickets([]);
//     localStorage.removeItem("token");
//     navigate("/login", { replace: true });
//   };

// useEffect(() => {
//   if (!user) return;

//   const socket = io(`${import.meta.env.VITE_API_URL}`, {
//     auth: { token: localStorage.getItem("token") }
//   });

//   socket.on("notification", (data) => {
//     if (data.type === "success") toast.success(data.message);
//     else if (data.type === "info") toast(data.message);
//     else toast(data.message);
//   });

//   socket.on("force_logout", (data) => {
//     toast.success(data?.reason || "Role updated. Please login again.");

//     logout();
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login", { replace: true });
//   });

//   return () => {
//     socket.disconnect();
//   };
// }, [user, logout, navigate]);

//   // Logic preserved: Fetch tickets (commented out in original, but structure kept if needed)
//   // useEffect(() => {
//   //   if (!user) return;
//   //   axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, {
//   //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   //   }).then(res => setTickets(res.data)).catch(console.error);
//   // }, [user]);

//   return (
//     <div className="relative min-h-screen font-sans text-slate-800 overflow-x-hidden perspective-2000">
//       <AnimatedBackground3D />

//       <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
//         {/* 3D Header Section */}
//         <motion.header
//           initial={{ opacity: 0, y: -50, rotateX: 15 }}
//           animate={{ opacity: 1, y: 0, rotateX: 0 }}
//           transition={{ type: "spring", stiffness: 80, damping: 20 }}
//           className="perspective-1000"
//         >
//           <TiltCard className="relative flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden group">
//             {/* Glass Reflection Effect */}
//             <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
            
//             <div className="space-y-2 relative z-10" style={{ transform: "translateZ(30px)" }}>
//               <div className="flex items-center gap-4">
//                 <motion.div 
//                   whileHover={{ rotate: 180, scale: 1.1 }}
//                   transition={{ duration: 0.5 }}
//                   className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30"
//                 >
//                   <LayoutDashboard className="text-white" size={28} />
//                 </motion.div>
//                 <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
//                   Hello,{" "}
//                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
//                     {user?.username || "User"}
//                   </span>
//                 </h1>
//               </div>
//               <p className="text-slate-500 font-medium text-lg max-w-md pl-1">
//                 Welcome to your command center.
//               </p>
//             </div>

//             <div className="mt-6 md:mt-0 relative z-10 flex items-center gap-4" style={{ transform: "translateZ(40px)" }}>
//               <div className="flex items-center gap-3 px-6 py-3 bg-white/50 rounded-full border border-white/60 shadow-sm backdrop-blur-md">
//                 <div className="relative">
//                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
//                   <Sparkles size={20} className="text-amber-500" />
//                 </div>
//                 <span className="text-sm font-bold text-slate-700">
//                   System Operational
//                 </span>
//               </div>
              
//               <motion.button
//                 whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 bg-red-500/90 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-red-500/30 transition-all font-semibold backdrop-blur-sm"
//               >
//                 <LogOut size={18} />
//                 <span className="hidden md:inline">Logout</span>
//               </motion.button>
//             </div>
//           </TiltCard>
//         </motion.header>

//         {/* Main Layout Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 perspective-1000">
//           {/* 3D Sidebar */}
//           <motion.nav
//             initial={{ opacity: 0, x: -50, rotateY: 15 }}
//             animate={{ opacity: 1, x: 0, rotateY: 0 }}
//             transition={{ delay: 0.1, type: "spring" }}
//             className="lg:col-span-3"
//           >
//             <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-xl p-4 sticky top-8 flex flex-col gap-3">
//               {tabs.map((t) => (
//                 <button
//                   key={t.id}
//                   onClick={() => setTab(t.id)}
//                   className="relative group w-full perspective-500"
//                 >
//                   <motion.div
//                     className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 w-full border ${ 
//                       tab === t.id
//                         ? "bg-white border-white/60 shadow-lg shadow-indigo-500/10"
//                         : "hover:bg-white/40 border-transparent hover:border-white/30"
//                     }`}
//                     style={{ transformStyle: "preserve-3d" }}
//                     animate={tab === t.id ? { z: 20, scale: 1.02 } : { z: 0, scale: 1 }}
//                   >
//                     {tab === t.id && (
//                       <motion.div
//                         layoutId="activeTabIndicator"
//                         className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 rounded-r-full"
//                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                       />
//                     )}
                    
//                     <div
//                       className={`p-2.5 rounded-xl transition-colors duration-300 ${
//                         tab === t.id
//                           ? `bg-gradient-to-br ${t.gradient} text-white shadow-md`
//                           : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-500"
//                       }`}
//                     >
//                       <t.icon size={20} />
//                     </div>
//                     <span className={`font-bold transition-colors ${tab === t.id ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"}`}>
//                       {t.label}
//                     </span>
                    
//                     {tab === t.id && (
//                       <motion.div 
//                         initial={{ opacity: 0, x: -10 }} 
//                         animate={{ opacity: 1, x: 0 }} 
//                         className="ml-auto"
//                       >
//                         <Layers size={16} className="text-indigo-400" />
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 </button>
//               ))}
//             </div>
//           </motion.nav>

//           {/* 3D Content Area */}
//           <div className="lg:col-span-9 perspective-1000">
//             <AnimatePresence mode="wait">
//               <motion.main
//                 key={tab}
//                 initial={{ opacity: 0, rotateX: -10, y: 50, scale: 0.9 }}
//                 animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, rotateX: 10, y: -50, scale: 0.9 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 25 }}
//                 className="min-h-[600px] h-full"
//                 style={{ transformStyle: "preserve-3d" }}
//               >
//                 <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 p-6 md:p-10 h-full relative overflow-hidden">
//                   {/* Decorative background elements inside card */}
//                   <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -z-10" />
//                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 rounded-tr-full -z-10" />

//                   <div className="relative z-10">
//                     {tab === "tickets" && <MyTickets />}
//                     {tab === "raise" && <RaiseTicket />}
//                     {tab === "notifications" && <Notifications />}
//                     {tab === "profile" && <UserProfile />}
//                   </div>
//                 </div>
//               </motion.main>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { io } from "socket.io-client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Ticket,
  PlusCircle,
  Bell,
  LayoutDashboard,
  Sparkles,
  User,
  LogOut,
  Layers
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Sub-components
import RaiseTicket from "./RaiseTicket";
import MyTickets from "./MyTickets";
import Notifications from "./Notifications";
import UserProfile from "./UserProfile";

/* ---------------- 3D UTILITIES ---------------- */

const TiltCard = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ---------------- 3D BACKGROUND ---------------- */
const AnimatedBackground3D = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{
            rotateX: [0, 20, 0],
            rotateY: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[100px] mix-blend-screen"
          style={{ transformStyle: "preserve-3d", translateZ: -100 }}
        />

        <motion.div
          animate={{
            rotateX: [0, -20, 0],
            rotateY: [0, -30, 0],
            x: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-[100px] mix-blend-screen"
          style={{ transformStyle: "preserve-3d", translateZ: -50 }}
        />
      </motion.div>
    </div>
  );
};

/* ---------------- MAIN DASHBOARD ---------------- */
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const tabs = [
    { id: "tickets", label: "My Tickets", icon: Ticket, color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
    { id: "raise", label: "Raise Ticket", icon: PlusCircle, color: "bg-indigo-500", gradient: "from-indigo-500 to-indigo-600" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "bg-amber-500", gradient: "from-amber-500 to-amber-600" },
    { id: "profile", label: "Profile", icon: User, color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
  ];

  const handleLogout = () => {
    logout();
    setTickets([]);
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!user) return;

    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token: localStorage.getItem("token") }
    });

    socket.on("notification", (data) => {
      if (data.type === "success") toast.success(data.message);
      else if (data.type === "info") toast(data.message);
      else toast(data.message);
    });

    socket.on("force_logout", (data) => {
      toast.success(data?.reason || "Role updated. Please login again.");

      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, logout, navigate]);

  return (
    <div className="relative min-h-screen font-sans text-slate-200 overflow-x-hidden perspective-2000">
      <AnimatedBackground3D />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -50, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="perspective-1000"
        >
          <TiltCard className="relative flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-700/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="space-y-2 relative z-10" style={{ transform: "translateZ(30px)" }}>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20"
                >
                  <LayoutDashboard className="text-white" size={28} />
                </motion.div>
                <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">
                  Hello,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                    {user?.username || "User"}
                  </span>
                </h1>
              </div>
              <p className="text-slate-400 font-medium text-lg max-w-md pl-1">
                Welcome to your command center.
              </p>
            </div>

            <div className="mt-6 md:mt-0 relative z-10 flex items-center gap-4" style={{ transform: "translateZ(40px)" }}>
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50 shadow-sm backdrop-blur-md">
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse" />
                  <Sparkles size={20} className="text-amber-400" />
                </div>
                <span className="text-sm font-bold text-slate-300">
                  System Operational
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/80 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-red-500/20 transition-all font-semibold backdrop-blur-sm border border-red-500/50 hover:border-red-500"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </motion.button>
            </div>
          </TiltCard>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 perspective-1000">
          <motion.nav
            initial={{ opacity: 0, x: -50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="lg:col-span-3"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 shadow-xl p-4 sticky top-8 flex flex-col gap-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative group w-full perspective-500"
                >
                  <motion.div
                    className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 w-full border ${
                      tab === t.id
                        ? "bg-slate-800 border-slate-600 shadow-lg shadow-indigo-500/10"
                        : "hover:bg-slate-800/40 border-transparent hover:border-slate-700/50"
                    }`}
                    style={{ transformStyle: "preserve-3d" }}
                    animate={tab === t.id ? { z: 20, scale: 1.02 } : { z: 0, scale: 1 }}
                  >
                    {tab === t.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      className={`p-2.5 rounded-xl transition-colors duration-300 ${
                        tab === t.id
                          ? `bg-gradient-to-br ${t.gradient} text-white shadow-md`
                          : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-indigo-400"
                      }`}
                    >
                      <t.icon size={20} />
                    </div>
                    <span className={`font-bold transition-colors ${tab === t.id ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200"}`}>
                      {t.label}
                    </span>

                    {tab === t.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto"
                      >
                        <Layers size={16} className="text-indigo-400" />
                      </motion.div>
                    )}
                  </motion.div>
                </button>
              ))}
            </div>
          </motion.nav>

          <div className="lg:col-span-9 perspective-1000">
            <AnimatePresence mode="wait">
              <motion.main
                key={tab}
                initial={{ opacity: 0, rotateX: -10, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, rotateX: 10, y: -50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="min-h-[600px] h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-700/50 p-6 md:p-10 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full -z-10" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full -z-10" />

                  <div className="relative z-10">
                    {tab === "tickets" && <MyTickets />}
                    {tab === "raise" && <RaiseTicket />}
                    {tab === "notifications" && <Notifications />}
                    {tab === "profile" && <UserProfile />}
                  </div>
                </div>
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { io } from "socket.io-client";
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Ticket,
//   PlusCircle,
//   Bell,
//   User,
//   LogOut,
//   Shield,
//   Activity,
//   ChevronRight,
//   LayoutDashboard,
//   Settings,
//   ExternalLink
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";

// import RaiseTicket from "./RaiseTicket";
// import MyTickets from "./MyTickets";
// import Notifications from "./Notifications";
// import UserProfile from "./UserProfile";

// /* ---------------- PROFESSIONAL BACKGROUND ---------------- */
// const DashboardBackground = () => {
//   return (
//     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50">
//       <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
//       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50" />
//     </div>
//   );
// };

// /* ---------------- MAIN DASHBOARD ---------------- */
// export default function UserDashboard() {
//   const { user, logout } = useAuth();
//   const [tab, setTab] = useState("tickets");
//   const navigate = useNavigate();

//   const tabs = [
//     { id: "tickets", label: "My Tickets", icon: Ticket, description: "View and manage your active support requests" },
//     { id: "raise", label: "Raise Ticket", icon: PlusCircle, description: "Submit a new request for assistance" },
//     { id: "notifications", label: "Notifications", icon: Bell, description: "Updates and system alerts" },
//     { id: "profile", label: "Account Settings", icon: User, description: "Manage your personal information" },
//   ];

//   const handleLogout = () => {
//     logout();
//     localStorage.removeItem("token");
//     navigate("/login", { replace: true });
//   };

//   useEffect(() => {
//     if (!user) return;

//     const token = localStorage.getItem("token");
//     const socket = io(`${import.meta.env.VITE_API_URL}`, {
//       auth: { token }
//     });

//     socket.on("notification", (data) => {
//       toast.custom((t) => (
//         <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-blue-600`}>
//           <div className="flex-1 w-0 p-4">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 pt-0.5">
//                 <Activity className="h-10 w-10 text-blue-600" />
//               </div>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-semibold text-slate-900">System Notification</p>
//                 <p className="mt-1 text-sm text-slate-500">{data.message}</p>
//               </div>
//             </div>
//           </div>
//           <div className="flex border-l border-slate-200">
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       ));
//     });

//     socket.on("force_logout", () => {
//       logout();
//       localStorage.removeItem("token");
//       navigate("/login", { replace: true });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [user, logout, navigate]);

//   return (
//     <div className="relative min-h-screen font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
//       <DashboardBackground />

//       <div className="relative z-10 flex min-h-screen">
//         {/* Sidebar */}
//         <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
//           <div className="p-8">
//             <div className="flex items-center gap-3 mb-8">
//               <div className="bg-blue-600 p-2 rounded-lg">
//                 <Shield className="text-white" size={24} />
//               </div>
//               <span className="font-bold text-xl tracking-tight text-slate-800">SupportPortal</span>
//             </div>

//             <nav className="space-y-1">
//               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
//               {tabs.map((t) => (
//                 <button
//                   key={t.id}
//                   onClick={() => setTab(t.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
//                     tab === t.id
//                       ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
//                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
//                   }`}
//                 >
//                   <t.icon size={20} className={tab === t.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
//                   <span className="text-sm font-semibold">{t.label}</span>
//                   {tab === t.id && <ChevronRight size={16} className="ml-auto text-blue-400" />}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="mt-auto p-6 border-t border-slate-100">
//             <div className="bg-slate-50 rounded-2xl p-4 mb-4">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
//                   {user?.username?.charAt(0).toUpperCase() || "U"}
//                 </div>
//                 <div className="overflow-hidden">
//                   <p className="text-sm font-bold text-slate-900 truncate">{user?.username || "User Account"}</p>
//                   <p className="text-xs text-slate-500 truncate">Standard Access</p>
//                 </div>
//               </div>
//               <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
//                 <div className="bg-blue-600 h-full w-[85%] rounded-full" />
//               </div>
//               <p className="text-[10px] text-slate-400 mt-2 font-medium">Profile completeness: 85%</p>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
//             >
//               <LogOut size={18} />
//               Sign Out
//             </button>
//           </div>
//         </aside>

//         {/* Main Content Area */}
//         <main className="flex-1 flex flex-col min-w-0">
//           {/* Top Bar */}
//           <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
//             <div className="flex items-center gap-4">
//               <h2 className="text-lg font-bold text-slate-800">
//                 {tabs.find(t => t.id === tab)?.label}
//               </h2>
//               <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
//                 Dashboard / {tab}
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//               <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
//                 <Settings size={20} />
//               </button>
//               <div className="h-6 w-px bg-slate-200 mx-2" />
//               <div className="flex items-center gap-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
//                 <Activity size={16} />
//                 <span className="text-xs font-bold uppercase tracking-wide">System Online</span>
//               </div>
//             </div>
//           </header>

//           {/* Scrollable Content */}
//           <div className="flex-1 p-10 overflow-y-auto">
//             <div className="max-w-5xl mx-auto">
//               {/* Context Header Card */}
//               <div className="mb-8 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
//                 <div className="relative z-10">
//                   <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username || "User"}</h1>
//                   <p className="text-slate-300 max-w-md">
//                     {tabs.find(t => t.id === tab)?.description}
//                   </p>
//                 </div>
//                 <LayoutDashboard className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
                
//                 <div className="mt-6 flex gap-4 relative z-10">
//                   <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
//                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Tickets</p>
//                     <p className="text-xl font-bold">12</p>
//                   </div>
//                   <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
//                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Resolved</p>
//                     <p className="text-xl font-bold">08</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Dynamic Content Component */}
//               <div className="bg-white border border-slate-200 rounded-3xl shadow-sm min-h-[500px] overflow-hidden">
//                 <div className="border-b border-slate-100 p-6 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-2 h-6 bg-blue-600 rounded-full" />
//                     <span className="font-bold text-slate-800 uppercase text-sm tracking-wide">Active Workspace</span>
//                   </div>
//                   <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
//                     View Documentation <ExternalLink size={12} />
//                   </button>
//                 </div>
                
//                 <div className="p-8">
//                   {tab === "tickets" && <MyTickets />}
//                   {tab === "raise" && <RaiseTicket />}
//                   {tab === "notifications" && <Notifications />}
//                   {tab === "profile" && <UserProfile />}
//                 </div>
//               </div>

//               {/* Footer */}
//               <footer className="mt-12 text-center">
//                 <p className="text-xs text-slate-400 font-medium tracking-wide">
//                   &copy; {new Date().getFullYear()} Enterprise Support Systems. All rights reserved.
//                 </p>
//               </footer>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }