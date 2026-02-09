  import { io } from "socket.io-client";
  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom"
  import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
  } from "framer-motion";
  import {
    Ticket,
    PlusCircle,
    Bell,
    LayoutDashboard,
    Sparkles,
    User,
  } from "lucide-react";
  import { useAuth } from "../context/AuthContext";
  import RaiseTicket from "./RaiseTicket";
  import MyTickets from "./MyTickets";
  import Notifications from "./Notifications";
  import axios from "axios";
import toast from "react-hot-toast";
import UserProfile from "./UserProfile";
// import UserProfileSection from "./UserProfileSection.jsx"
  /* ---------------- 3D ANIMATED BACKGROUND ---------------- */
  const AnimatedBackground3D = () => {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-slate-50" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{ perspective: "1000px" }}
        >
          {/* Floating Orbs */}
          <motion.div
            animate={{
              rotateX: [0, 10, 0],
              rotateY: [0, 15, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl mix-blend-multiply"
            style={{ transformStyle: "preserve-3d", translateZ: -100 }}
          />

          <motion.div
            animate={{
              rotateX: [0, -10, 0],
              rotateY: [0, -20, 0],
              x: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 blur-3xl mix-blend-multiply"
            style={{ transformStyle: "preserve-3d", translateZ: -50 }}
          />

          {/* Grid Plane */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </motion.div>
      </div>
    );
  };

  /* ---------------- MAIN DASHBOARD ---------------- */
  export default function UserDashboard() {
    // const { user } = useAuth();
    const [tab, setTab] = useState("tickets");
const { user, logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    // const { logout } = useAuth();
    const navigate = useNavigate();
    const tabs = [
      { id: "tickets", label: "My Tickets", icon: Ticket, color: "bg-blue-500" },
      { id: "raise", label: "Raise Ticket", icon: PlusCircle, color: "bg-indigo-500" },
      { id: "notifications", label: "Notifications", icon: Bell, color: "bg-amber-500" },
      {id: "profile", label: "Profile", icon: User, color: "bg-emerald-500"},
    ];

    /* --------- 3D PARALLAX HEADER --------- */
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

const handleLogout = () => {
  logout(); // clears token + user state
  setTickets([]);
  localStorage.removeItem("token");
  navigate("/login", {replace: true}); // use React Router to redirect

};

useEffect(() => {
  if (!user) return;

  const socket = io("http://localhost:5000", {
    auth: { token: localStorage.getItem("token") }
  });

  socket.on("notification", (data)=>{
    if (data.type === "success") toast.success(data.message);
    if(data.type === "info") toast.info(data.message);
    if (data.type ==="warning") toast.warning(data.message);
  });

  // socket.on("ticket_created", data => toast.success(data.message));
  // socket.on("ticket_assigned", data => toast.info(data.message));
  // socket.on("ticket_resolved", data => toast.success(data.message));

  return () => {
    socket.disconnect();
  };
}, [user]);

// useEffect(() => {
//   setTickets([]);        // 🔥 clear old user's tickets
//   if (!user) return;

//   axios.get("http://localhost:5000/api/tickets", {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   })
//   .then(res => setTickets(res.data))
//   .catch(console.error);
// }, [user]); // 🔥 CRITICAL


    return (
      <div className="relative min-h-screen font-sans text-slate-800 overflow-x-hidden">
        <AnimatedBackground3D />

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="perspective-1000"
          >
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/40 overflow-hidden group"
            >
              <div className="space-y-2 relative z-10" style={{ transform: "translateZ(20px)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
                    <LayoutDashboard className="text-white" size={24} />
                  </div>
                  <h1 className="text-4xl font-extrabold text-slate-900">
                    Hello,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                      {user?.username || "User"}
                    </span>
                  </h1>
                </div>
                <p className="text-slate-500 font-medium text-lg max-w-md">
                  Welcome to your command center. Manage support and track progress in real-time.
                </p>
              </div>

              <div className="mt-6 md:mt-0 relative z-10" style={{ transform: "translateZ(30px)" }}>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/50 rounded-full border border-white/60 shadow-sm backdrop-blur-md">
                  <div className="relative">
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    <Sparkles size={20} className="text-amber-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    System Operational
                  </span>
                </div>
              </div>
            </motion.div>
            <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Logout</button>
          </motion.header>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <motion.nav
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg p-4 sticky top-8">
                <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`relative group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all w-full ${
                        tab === t.id
                          ? "bg-white shadow-md text-slate-900"
                          : "hover:bg-white/50 text-slate-500"
                      }`}
                    >
                      {tab === t.id && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute left-0 w-1.5 h-8 bg-indigo-600 rounded-r-full"
                        />
                      )}
                      <div
                        className={`p-2 rounded-xl ${
                          tab === t.id
                            ? `${t.color} text-white`
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <t.icon size={20} />
                      </div>
                      <span className="font-semibold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.nav>

            {/* Content */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                <motion.main
                  key={tab}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="min-h-[600px]"
                >
                  <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-10 h-full">
                    {tab === "tickets" && <MyTickets />}
                    {tab === "raise" && <RaiseTicket />}
                    {tab === "notifications" && <Notifications />}
                    {tab === "profile" && <UserProfile />}
                  </div>
                </motion.main>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }
