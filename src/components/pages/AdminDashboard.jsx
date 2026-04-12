// import React, { useEffect, useState, useRef, useMemo } from "react";
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   XAxis,
//   CartesianGrid,
// } from "recharts";
// import { io } from "socket.io-client";
// import { toast } from "react-hot-toast";
// import {
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   AnimatePresence,
// } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import {
//   Users,
//   ShieldCheck,
//   Clock,
//   Briefcase,
//   Mail,
//   Sparkles,
//   LayoutDashboard,
//   LogOut,
//   Activity,
//   Pencil,
//   Trash2,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Layers,
//   Bell,
//   Download,
// } from "lucide-react";
// import { deleteStaff } from "../../services/adminService";
// import CreateStaff from "./CreateStaff";
// import EditStaff from "./EditStaff";
// import api from "../../services/api";

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring", stiffness: 100 },
//   },
// };

// const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// const TiltCard = ({ children, className = "" }) => {
//   const ref = useRef(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
//   const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

//   const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
//   const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

//   const handleMouseMove = (e) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
//     y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => {
//         x.set(0);
//         y.set(0);
//       }}
//       style={{
//         rotateX,
//         rotateY,
//         transformStyle: "preserve-3d",
//         perspective: 1000,
//       }}
//       className={`relative ${className}`}
//     >
//       {children}
//     </motion.div>
//   );
// };

// export default function AdminDashboard() {
//   const [staff, setStaff] = useState([]);
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [showCreate, setShowCreate] = useState(false);
//   const [tickets, setTickets] = useState([]);
//   const [llmData, setLlmData] = useState([]);
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [deptStats, setDeptStats] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [workload, setWorkload] = useState([]);
//   const [topStaff, setTopStaff] = useState([]);
//   const [avgTime, setAvgTime] = useState(0);

//   const navigate = useNavigate();
//   const socketRef = useRef(null);

//   const authHeader = () => ({
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   });

//   const SLA_MINUTES = { Critical: 60, High: 120, Medium: 360, Low: 1440 };

//   const isSlaBreached = (t) => {
//     if (!t?.createdAt) return false;
//     if (t.status === "Resolved" || t.status === "Closed") return false;
//     const mins = SLA_MINUTES[t.priority] ?? 1440;
//     const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
//     return ageMin > mins;
//   };

//   const fetchStaff = async () => {
//     try {
//       const res = await api.get("/admin/staff", authHeader());
//       setStaff(res.data || []);
//     } catch (error) {
//       console.error("Failed to fetch staff:", error);
//     }
//   };

//   const fetchTickets = async () => {
//     try {
//       const res = await api.get("/admin/incidents", authHeader());
//       setTickets(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Failed to fetch tickets", err);
//     }
//   };

//   const fetchAuditLogs = async () => {
//     try {
//       const res = await api.get("/admin/audit-logs", authHeader());
//       setAuditLogs(res.data || []);
//     } catch (err) {
//       console.error("Failed to fetch audit logs", err);
//     }
//   };

//   const fetchLlmAccuracy = async () => {
//     try {
//       const res = await api.get("/admin/llm-accuracy", authHeader());
//       setLlmData(res.data || []);
//     } catch (err) {
//       console.error("Failed to fetch LLM data", err);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const res = await api.get("/admin/stats", authHeader());
//       setStats(res.data);
//     } catch (err) {
//       console.error("Failed to fetch stats", err);
//     }
//   };

//   useEffect(() => {
//     fetchStaff();
//     fetchTickets();
//     fetchAuditLogs();
//     fetchLlmAccuracy();
//     fetchStats();

//     api.get("/admin/stats/incidents-by-dept", authHeader()).then((res) => setDeptStats(res.data || []));
//     api.get("/admin/stats/avg-resolution", authHeader()).then((res) => setAvgTime(res.data?.avgMinutes || 0));
//     api.get("/admin/stats/staff-workload", authHeader()).then((res) => setWorkload(res.data || []));
//     api.get("/admin/stats/active-staff", authHeader()).then((res) => setTopStaff(res.data || []));
//   }, []);

//   useEffect(() => {
//     socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
//       transports: ["websocket"],
//       auth: {
//         token: localStorage.getItem("token"),
//       },
//     });

//     const s = socketRef.current;

//     const push = (n) => {
//       setNotifications((prev) => [n, ...prev].slice(0, 20));
//       toast.success(n.message || "New notification");
//     };

//     s.on("connect", () => {
//       s.emit("join_room", { role: "admin" });
//     });

//     s.on("notification", push);
//     s.on("ticket_created", () => {
//       fetchTickets();
//       push({ message: "New ticket created" });
//     });
//     s.on("ticket_department_updated", () => {
//       fetchTickets();
//       push({ message: "Ticket department updated" });
//     });
//     s.on("ticket_assigned", () => {
//       fetchTickets();
//       push({ message: "Ticket assigned" });
//     });
//     s.on("sla_breach", (data) => {
//       push({ message: `SLA breached: ${data?.title || "Unknown ticket"}` });
//     });
//     s.on("stats:update", (data) => {
//       setStats(data);
//     });

//     return () => {
//       s.off("notification", push);
//       s.off("ticket_created");
//       s.off("ticket_department_updated");
//       s.off("ticket_assigned");
//       s.off("sla_breach");
//       s.off("stats:update");
//       s.disconnect();
//     };
//   }, []);

//   const handleLogout = () => {
//     if (socketRef.current) socketRef.current.disconnect();
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this staff member?")) return;
//     try {
//       await deleteStaff(id);
//       fetchStaff();
//       toast.success("Staff deleted");
//     } catch (err) {
//       toast.error("Delete failed");
//       console.error(err);
//     }
//   };

//   const handleEdit = (staffMember) => {
//     setEditingStaff(staffMember);
//   };

//   const toggleActive = async (id, isActive) => {
//     try {
//       const url = isActive
//         ? `/admin/staff/${id}/deactivate`
//         : `/admin/staff/${id}/activate`;

//       await api.put(url, {}, authHeader());
//       fetchStaff();
//       toast.success(isActive ? "Staff deactivated" : "Staff activated");
//     } catch (err) {
//       toast.error("Failed to update staff status");
//       console.error(err);
//     }
//   };

// const overrideDepartment = async (id, department) => {
//   try {
//     const res = await api.post(
//       `/admin/reassign-department/${id}`,
//       { department },
//       authHeader()
//     );

//     setTickets((prev) =>
//       prev.map((t) => (t._id === id ? res.data.incident : t))
//     );

//     toast.success("Department overridden");
//     fetchTickets();
//   } catch (err) {
//     toast.error("Failed to override department");
//     console.error(err);
//   }
// };

//   const exportTicketsCsv = () => {
//     if (!tickets.length) {
//       toast.error("No tickets to export");
//       return;
//     }

//     const rows = tickets.map((t) => ({
//       id: t._id,
//       title: t.title,
//       department: t.department,
//       priority: t.priority,
//       status: t.status,
//       assignedTo: t.assignedTo?.full_name || "",
//       createdBy: t.createdBy?.username || "",
//       createdAt: t.createdAt,
//     }));

//     const headers = Object.keys(rows[0]);
//     const csv = [
//       headers.join(","),
//       ...rows.map((r) =>
//         headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

// const staffPerformance = useMemo(() => {
//   if (!staff.length || !tickets.length) return [];

//   const statsMap = new Map();

//   staff.forEach((s) => {
//     statsMap.set(String(s._id), {
//       _id: s._id,
//       full_name: s.full_name,
//       email: s.email,
//       department: s.department,

//       assigned: 0,
//       resolved: 0,
//       open: 0,
//       breached: 0,

//       totalResolutionMinutes: 0,
//       avgResolutionMinutes: 0,
//       resolutionRate: 0,

//       feedbackCount: 0,
//       totalRating: 0,
//       avgRating: 0,

//       resolvedCompletelyYes: 0,
//       recommendYes: 0,
//       positiveBehavior: 0,
//       fastResponse: 0,

//       resolvedCompletelyPct: 0,
//       recommendPct: 0,
//       behaviorPct: 0,
//       fastResponsePct: 0,

//       comments: [],
//       score: 0,
//     });
//   });

//   tickets.forEach((t) => {
//     const assignedId =
//       typeof t.assignedTo === "object" ? t.assignedTo?._id : t.assignedTo;

//     if (!assignedId) return;

//     const key = String(assignedId);
//     if (!statsMap.has(key)) return;

//     const item = statsMap.get(key);
//     item.assigned += 1;

//     const createdAt = t.createdAt ? new Date(t.createdAt).getTime() : null;
//     const resolvedAt = t.resolvedAt || t.updatedAt;

//     if (t.status === "Resolved" || t.status === "Closed") {
//       item.resolved += 1;

//       if (createdAt && resolvedAt) {
//         const mins = (new Date(resolvedAt).getTime() - createdAt) / 60000;
//         if (mins > 0) item.totalResolutionMinutes += mins;
//       }
//     } else {
//       item.open += 1;
//     }

//     if (isSlaBreached(t)) {
//       item.breached += 1;
//     }

//     if (t.feedback?.rating) {
//       item.feedbackCount += 1;
//       item.totalRating += Number(t.feedback.rating);

//       if (t.feedback.resolvedCompletely === "Yes") {
//         item.resolvedCompletelyYes += 1;
//       }

//       if (t.feedback.recommendSupport === "Yes") {
//         item.recommendYes += 1;
//       }

//       if (["Excellent", "Good"].includes(t.feedback.staffBehavior)) {
//         item.positiveBehavior += 1;
//       }

//       if (["Very Fast", "Fast"].includes(t.feedback.responseSpeed)) {
//         item.fastResponse += 1;
//       }

//       if (t.feedback.comment?.trim()) {
//         item.comments.push({
//           comment: t.feedback.comment,
//           rating: t.feedback.rating,
//           ticketId: t.ticketId,
//           submittedAt: t.feedback.submittedAt,
//         });
//       }
//     }
//   });

//   const result = Array.from(statsMap.values()).map((item) => {
//     item.avgResolutionMinutes =
//       item.resolved > 0
//         ? Math.round(item.totalResolutionMinutes / item.resolved)
//         : 0;

//     item.resolutionRate =
//       item.assigned > 0
//         ? Math.round((item.resolved / item.assigned) * 100)
//         : 0;

//     item.avgRating =
//       item.feedbackCount > 0
//         ? Number((item.totalRating / item.feedbackCount).toFixed(1))
//         : 0;

//     item.resolvedCompletelyPct =
//       item.feedbackCount > 0
//         ? Math.round((item.resolvedCompletelyYes / item.feedbackCount) * 100)
//         : 0;

//     item.recommendPct =
//       item.feedbackCount > 0
//         ? Math.round((item.recommendYes / item.feedbackCount) * 100)
//         : 0;

//     item.behaviorPct =
//       item.feedbackCount > 0
//         ? Math.round((item.positiveBehavior / item.feedbackCount) * 100)
//         : 0;

//     item.fastResponsePct =
//       item.feedbackCount > 0
//         ? Math.round((item.fastResponse / item.feedbackCount) * 100)
//         : 0;

//     item.score =
//       item.resolved * 8 +
//       item.resolutionRate * 2 +
//       item.avgRating * 15 +
//       item.recommendPct -
//       item.open * 3 -
//       item.breached * 8 -
//       Math.floor(item.avgResolutionMinutes / 60);

//     return item;
//   });

//   return result.sort((a, b) => b.score - a.score);
// }, [staff, tickets]);

//   const bestStaff = staffPerformance[0];
//   const weakStaff = staffPerformance.filter(
//   (s) => s.feedbackCount >= 2 && (s.avgRating < 3 || s.recommendPct < 50)
// );

// const excellentStaff = staffPerformance.filter(
//   (s) => s.feedbackCount >= 2 && s.avgRating >= 4 && s.recommendPct >= 70
// );
// const renderAuditMessage = (log) => {
//   const ticketShort = log.incidentId ? `#${String(log.incidentId).slice(-4)}` : "";
//   const d = log.details || {};

//   switch (log.action) {
//     case "DEPARTMENT_UPDATED":
//       return (
//         <>
//           changed Ticket {ticketShort} from{" "}
//           <span className="text-slate-400">{log.originalDepartment}</span> to{" "}
//           <span className="text-white">{log.updatedDepartment}</span>
//         </>
//       );

//     case "TICKET_RESOLVED":
//       return (
//         <>
//           resolved Ticket {ticketShort}
//         </>
//       );

//     case "TICKET_REOPENED":
//       return (
//         <>
//           reopened Ticket {ticketShort}
//         </>
//       );

//     case "TICKET_ASSIGNED":
//       return (
//         <>
//           assigned Ticket {ticketShort} to{" "}
//           <span className="text-white">{d.assignedToName || "staff"}</span>
//         </>
//       );

//     case "FEEDBACK_SUBMITTED":
//       return (
//         <>
//           received feedback for Ticket {ticketShort} with rating{" "}
//           <span className="text-amber-400">{d.rating}/5</span>
//         </>
//       );

//     case "STAFF_CREATED":
//       return (
//         <>
//           created staff{" "}
//           <span className="text-white">{d.full_name}</span>
//         </>
//       );

//     case "STAFF_DELETED":
//       return (
//         <>
//           deleted staff{" "}
//           <span className="text-white">{d.full_name}</span>
//         </>
//       );

//     case "STAFF_ACTIVATED":
//       return (
//         <>
//           activated staff{" "}
//           <span className="text-white">{d.full_name}</span>
//         </>
//       );

//     case "STAFF_DEACTIVATED":
//       return (
//         <>
//           deactivated staff{" "}
//           <span className="text-white">{d.full_name}</span>
//         </>
//       );

//     default:
//       return <>performed action: {log.action}</>;
//   }
// };
// const approveClose = async (id) => {
//   try {
//     await api.patch(`/incidents/${id}/approve-close`, {}, authHeader());  
//     toast.success("Incident close approved");
//     fetchTickets();
//   } catch (err) {
//     toast.error("Failed to approve close");
//     console.error(err);
//   }
// };

// const rejectClose = async (id) => {
//   try {
//     await api.patch(`/incidents/${id}/reject-close`, {}, authHeader());  
//     toast.success("Incident close rejected");
//     fetchTickets();
//   } catch (err) {
//     toast.error("Failed to reject close");
//     console.error(err);
//   }
// };
//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
//       <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
//         <motion.header
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-2xl"
//         >
//           <div className="flex items-center gap-5">
//             <div className="p-3 bg-indigo-500/10 rounded-2xl">
//               <LayoutDashboard className="w-8 h-8 text-indigo-400" />
//             </div>
//             <div>
//               <h2 className="text-3xl font-bold text-white tracking-tight">
//                 Admin Portal
//               </h2>
//               <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//                 </span>
//                 System Operational
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition relative"
//               >
//                 <Bell className="w-5 h-5" />
//                 {notifications.length > 0 && (
//                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-800" />
//                 )}
//               </button>

//               <AnimatePresence>
//                 {showNotifications && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                     className="absolute right-0 top-full mt-4 w-80 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
//                   >
//                     <div className="p-4 border-b border-slate-800 flex justify-between items-center">
//                       <h4 className="font-bold text-white">Notifications</h4>
//                       <button
//                         onClick={() => setNotifications([])}
//                         className="text-xs text-indigo-400 hover:text-indigo-300"
//                       >
//                         Clear All
//                       </button>
//                     </div>
//                     <div className="max-h-64 overflow-y-auto p-2 space-y-1">
//                       {notifications.length === 0 ? (
//                         <p className="text-slate-500 text-sm text-center py-4">
//                           No new notifications
//                         </p>
//                       ) : (
//                         notifications.map((n, i) => (
//                           <div
//                             key={i}
//                             className="p-3 bg-slate-800/50 rounded-xl text-sm text-slate-300 border border-slate-700/50"
//                           >
//                             {n.message}
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <button
//               onClick={() => setShowCreate(true)}
//               className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-500/20"
//             >
//               <Sparkles className="w-4 h-4" />
//               <span className="hidden sm:inline">New Staff</span>
//             </button>

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium transition border border-rose-500/20"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="hidden sm:inline">Logout</span>
//             </button>
//           </div>
//         </motion.header>

// <motion.div
//   initial={{ x: 20, opacity: 0 }}
//   whileInView={{ x: 0, opacity: 1 }}
//   viewport={{ once: true }}
//   className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
// >
//   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//     <Sparkles className="w-4 h-4 text-emerald-400" />
//     Best Resolution Staff
//   </h3>

//   {staffPerformance.length === 0 ? (
//     <p className="text-slate-400 text-sm">Not enough ticket data available</p>
//   ) : (
//     <div className="space-y-3">
//       {staffPerformance.slice(0, 5).map((s, i) => (
//         <div
//           key={s._id}
//           className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40"
//         >
//           <div className="flex justify-between items-center mb-2">
//             <div>
//               <p className="text-white font-semibold">
//                 #{i + 1} {s.full_name}
//               </p>
//               <p className="text-xs text-slate-400">
//                 {s.department || "No department"}
//               </p>
//             </div>
//             <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
//               Score {s.score}
//             </span>
//           </div>

//           <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
//             <div>Assigned: {s.assigned}</div>
//             <div>Resolved: {s.resolved}</div>
//             <div>Open: {s.open}</div>
//             <div>Breached: {s.breached}</div>
//             <div>Resolution Rate: {s.resolutionRate}%</div>
//             <div>Avg Time: {s.avgResolutionMinutes} min</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )}
// </motion.div>
// <motion.div
//   initial={{ x: 20, opacity: 0 }}
//   whileInView={{ x: 0, opacity: 1 }}
//   viewport={{ once: true }}
//   className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
// >
//   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//     <Sparkles className="w-4 h-4 text-amber-400" />
//     Staff Feedback Analysis
//   </h3>

//   {staffPerformance.length === 0 ? (
//     <p className="text-slate-400 text-sm">No feedback data available</p>
//   ) : (
//     <div className="space-y-4">
//       {staffPerformance.slice(0, 5).map((s, i) => (
//         <div
//           key={s._id}
//           className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40"
//         >
//           <div className="flex justify-between items-center mb-3">
//             <div>
//               <p className="text-white font-semibold">
//                 #{i + 1} {s.full_name}
//               </p>
//               <p className="text-xs text-slate-400">
//                 {s.department || "No department"}
//               </p>
//             </div>
//             <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
//               {s.feedbackCount} feedback
//             </span>
//           </div>

//           <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
//             <div>Avg Rating: {s.avgRating || 0} / 5</div>
//             <div>Recommend: {s.recommendPct || 0}%</div>
//             <div>Resolved Fully: {s.resolvedCompletelyPct || 0}%</div>
//             <div>Positive Behavior: {s.behaviorPct || 0}%</div>
//             <div>Fast Response: {s.fastResponsePct || 0}%</div>
//             <div>Score: {s.score}</div>
//           </div>

//           {s.comments.length > 0 ? (
//             <div className="mt-2 space-y-2">
//               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
//                 Recent Comments
//               </p>
//               {s.comments.slice(0, 2).map((c, idx) => (
//                 <div
//                   key={idx}
//                   className="text-xs text-slate-300 bg-slate-900/60 rounded-lg p-2 border border-slate-700"
//                 >
//                   <div className="flex justify-between mb-1">
//                     <span className="text-amber-400">⭐ {c.rating}/5</span>
//                     <span className="text-slate-500">{c.ticketId}</span>
//                   </div>
//                   <p>{c.comment}</p>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-xs text-slate-500">No comment feedback yet</p>
//           )}
//         </div>
//       ))}
//     </div>
//   )}
// </motion.div>
// <motion.div
//   initial={{ x: 20, opacity: 0 }}
//   whileInView={{ x: 0, opacity: 1 }}
//   viewport={{ once: true }}
//   className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
// >
//   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//     <AlertCircle className="w-4 h-4 text-rose-400" />
//     Suggested Admin Action
//   </h3>
//   <div className="space-y-3">
//     {excellentStaff.slice(0, 3).map((s) => (
//       <div
//         key={`good-${s._id}`}
//         className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
//       >
//         <p className="text-sm text-emerald-300 font-medium">
//           Reward / appreciate {s.full_name}
//         </p>
//         <p className="text-xs text-slate-300 mt-1">
//           Avg rating {s.avgRating}/5, recommend rate {s.recommendPct}%
//         </p>
//       </div>
//     ))}
//     {weakStaff.slice(0, 3).map((s) => (
//       <div
//         key={`weak-${s._id}`}
//         className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
//       >
//         <p className="text-sm text-rose-300 font-medium">
//           Review / retrain {s.full_name}
//         </p>
//         <p className="text-xs text-slate-300 mt-1">
//           Avg rating {s.avgRating}/5, recommend rate {s.recommendPct}%
//         </p>
//       </div>
//     ))}

//     {excellentStaff.length === 0 && weakStaff.length === 0 && (
//       <p className="text-sm text-slate-400">
//         Not enough feedback to suggest action yet.
//       </p>
//     )}
//   </div>
// </motion.div>
//         {stats && (
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
//           >
//             {[
//               { label: "Total Users", value: stats.totalUsers, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10" },
//               { label: "Open", value: stats.openIncidents, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
//               { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
//               { label: "Resolved", value: stats.resolvedIncidents, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
//               { label: "Closed", value: stats.closedIncidents, icon: XCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
//               { label: "Staff", value: stats.totalStaff, icon: Briefcase, color: "text-pink-400", bg: "bg-pink-500/10" },
//               { label: "Incidents", value: stats.totalIncidents, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
//             ].map((item, i) => (
//               <motion.div
//                 key={i}
//                 variants={itemVariants}
//                 className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition group"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <div className={`p-2 rounded-lg ${item.bg}`}>
//                     <item.icon className={`w-5 h-5 ${item.color}`} />
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-white">{item.value}</h3>
//                   <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
//                     {item.label}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-center items-center relative overflow-hidden"
//           >
//             <Clock className="w-12 h-12 mb-4 opacity-80" />
//             <h3 className="text-5xl font-bold mb-2">
//               {avgTime}
//               <span className="text-2xl font-normal opacity-70">min</span>
//             </h3>
//             <p className="text-indigo-200 font-medium">Avg Resolution Time</p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
//           >
//             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
//               <Sparkles className="w-4 h-4 text-indigo-400" />
//               LLM Accuracy
//             </h3>
//             <div className="h-48">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={llmData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
//                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#1e293b",
//                       borderColor: "#334155",
//                       color: "#f8fafc",
//                     }}
//                     cursor={{ fill: "#334155", opacity: 0.4 }}
//                   />
//                   <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
//           >
//             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
//               <PieChart className="w-4 h-4 text-emerald-400" />
//               Department Load
//             </h3>
//             <div className="h-48 flex items-center justify-center">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={deptStats}
//                     dataKey="count"
//                     nameKey="department"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                   >
//                     {deptStats.map((_, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0)" />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }} />
//                   <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </motion.div>
//         </div>

//         {/* {bestStaff && (
//           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
//             <p className="text-sm text-emerald-300">Best staff for resolving incidents</p>
//             <h4 className="text-xl font-bold text-white mt-1">{bestStaff.full_name}</h4>
//             <p className="text-sm text-slate-300 mt-2">
//               Resolved {bestStaff.resolved} tickets with {bestStaff.resolutionRate}% resolution rate
//             </p>
//             <p className="text-xs text-slate-400 mt-1">
//               Avg resolution time: {bestStaff.avgResolutionMinutes} min
//             </p>
//           </div>
//         )} */}

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           <div className="xl:col-span-2 space-y-8">
//             <section>
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                   <Users className="text-indigo-400" />
//                   Staff Directory
//                   <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">
//                     {staff.length}
//                   </span>
//                 </h3>
//               </div>

//               <motion.div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {staff.map((s) => (
//                   <TiltCard key={s._id}>
//                     <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
//                       <h4 className="font-bold text-white">{s.full_name}</h4>

//                       <p className="text-slate-400 text-sm flex items-center gap-2">
//                         <Mail className="w-3 h-3" />
//                         {s.email}
//                       </p>

//                       <div className="mt-4 flex justify-between items-center">
//                         <span className="text-xs flex items-center gap-2">
//                           <Briefcase className="w-3 h-3" />
//                           {s.department}
//                         </span>

//                         {s.isVerified ? (
//                           <span className="text-emerald-400 text-xs flex items-center gap-1">
//                             <ShieldCheck className="w-3 h-3" />
//                             Verified
//                           </span>
//                         ) : (
//                           <span className="text-amber-400 text-xs flex items-center gap-1">
//                             <Clock className="w-3 h-3" />
//                             Pending
//                           </span>
//                         )}
//                       </div>

//                       <div className="mt-4 flex justify-end gap-4">
//                         <button
//                           onClick={() => handleEdit(s)}
//                           className="text-indigo-400 hover:text-indigo-300"
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </button>

//                         <button
//                           onClick={() => handleDelete(s._id)}
//                           className="text-red-400 hover:text-red-300"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>

//                         <button
//                           onClick={() => toggleActive(s._id, s.isActive)}
//                           className={`text-xs px-3 py-1 rounded ${
//                             s.isActive
//                               ? "bg-red-500/20 text-red-300"
//                               : "bg-emerald-500/20 text-emerald-300"
//                           }`}
//                         >
//                           {s.isActive ? "Deactivate" : "Activate"}
//                         </button>
//                       </div>
//                     </div>
//                   </TiltCard>
//                 ))}
//               </motion.div>
//             </section>

//             <section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
//               <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                   <Activity className="text-rose-400" />
//                   Recent Incidents
//                 </h3>
//                 <button
//                   onClick={exportTicketsCsv}
//                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition"
//                 >
//                   <Download className="w-4 h-4" />
//                   Export CSV
//                 </button>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
//                     <tr>
//                       <th className="px-6 py-4">ID</th>
//                       <th className="px-6 py-4">Title</th>
//                       <th className="px-6 py-4">Dept</th>
//                       <th className="px-6 py-4">Status</th>
//                       <th className="px-6 py-4">Assigned</th>
//                       <th className="px-6 py-4">Attachment</th>
//                       <th className="px-6 py-4">SLA</th>
//                       <th className="px-6 py-4">Actions</th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-slate-800">
//                     {tickets.map((t) => (
//                       <motion.tr
//                         key={t._id}
//                         initial={{ opacity: 0 }}
//                         whileInView={{ opacity: 1 }}
//                         viewport={{ once: true }}
//                         className="hover:bg-slate-800/30 transition-colors"
//                       >
//                         <td className="px-6 py-4 font-mono text-indigo-400">
//                           #{t._id.slice(-4)}
//                         </td>
//                         <td className="px-6 py-4 font-medium text-white">{t.title}</td>
//                         <td className="px-6 py-4">
//                           <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">
//                             {t.department}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
//                               t.status === "Open"
//                                 ? "bg-slate-800 border-slate-600 text-slate-300"
//                                 : t.status === "In Progress"
//                                 ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
//                                 : t.status === "Resolved"
//                                 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
//                                 : "bg-purple-500/10 border-purple-500/20 text-purple-400"
//                             }`}
//                           >
//                             {t.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-slate-400">
//                           {t.assignedTo?.full_name || (
//                             <span className="text-slate-600 italic">Unassigned</span>
//                           )}
//                         </td>
//                                               <td className="px-6 py-4">
//   {t.attachment?.filename ? (
//     <a
//       href={`${import.meta.env.VITE_API_URL}/api/incidents/attachment/${t.attachment.filename}`}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="text-blue-400 hover:text-blue-300 underline text-xs"
//       onClick={(e) => e.stopPropagation()}
//     >
//       {t.attachment.originalName || "View File"}
//     </a>
//   ) : (
//     <span className="text-slate-500 text-xs">No File</span>
//   )}
// </td>
//                         <td className="px-6 py-4">
//                           {isSlaBreached(t) ? (
//                             <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
//                               <AlertCircle className="w-3 h-3" />
//                               Breached
//                             </span>
//                           ) : (
//                             <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
//                               <CheckCircle className="w-3 h-3" />
//                               OK
//                             </span>
//                           )}
//                         </td>
// <td className="px-6 py-4">
//   <div className="flex flex-col gap-2">
//     <select
//       className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
//       value={t.department}
//       onChange={(e) => overrideDepartment(t._id, e.target.value)}
//     >
//       <option value="IT">IT</option>
//       <option value="Network">Network</option>
//       <option value="Hardware">Hardware</option>
//       <option value="Accounts">Accounts</option>
//       <option value="General">General</option>
//     </select>

//     {t.status === "Resolved" && (
//       <div className="flex gap-2">
//         <button
//           onClick={() => approveClose(t._id)}
//           className="px-2 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
//         >
//           Approve Close
//         </button>

//         <button
//           onClick={() => rejectClose(t._id)}
//           className="px-2 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
//         >
//           Reject Close
//         </button>
//       </div>
//     )}
//   </div>
// </td>
//                       </motion.tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </section>
//           </div>

//           <div className="space-y-6">
//             <motion.div
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
//             >
//               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//                 <Briefcase className="w-4 h-4 text-blue-400" />
//                 Current Workload
//               </h3>
//               <div className="space-y-3">
//                 {workload.slice(0, 5).map((w, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
//                         {String(w._id).slice(-2)}
//                       </div>
//                       <span className="text-sm text-slate-300">
//                         Staff #{String(w._id).slice(-4)}
//                       </span>
//                     </div>
//                     <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-md text-xs">
//                       {w.openCount}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.1 }}
//               className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm"
//             >
//               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//                 <Sparkles className="w-4 h-4 text-amber-400" />
//                 Top Performers
//               </h3>
//               <div className="space-y-3">
//                 {topStaff.map((s, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
//                           i === 0
//                             ? "bg-amber-500/20 text-amber-400"
//                             : "bg-slate-700 text-slate-400"
//                         }`}
//                       >
//                         {i + 1}
//                       </div>
//                       <span className="text-sm text-slate-300">
//                         {s.full_name || s.name || "Staff"}
//                       </span>
//                     </div>
//                     <span className="text-xs text-emerald-400 font-medium">
//                       {s.count} Resolved
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.2 }}
//               className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm flex-1"
//             >
//               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//                 <Layers className="w-4 h-4 text-slate-400" />
//                 Audit Trail
//               </h3>
//               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//                 {auditLogs.length === 0 ? (
//                   <p className="text-slate-500 text-sm">No logs recorded.</p>
//                 ) : (
//                   auditLogs.map((log) => (
//                     <div
//                       key={log._id}
//                       className="relative pl-4 border-l-2 border-slate-800 pb-4 last:pb-0"
//                     >
//                       <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-600 ring-4 ring-slate-900" />
//                       <p className="text-xs text-slate-500 mb-1">
//                         {/* {new Date(log.createdAt).toLocaleString()} */}
//                       </p>
// <p className="text-sm text-slate-300">
//   <span className="text-indigo-400 font-medium">
//     {log.updatedBy?.username || "System"}
//   </span>{" "}
//   {renderAuditMessage(log)}
// </p>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         <AnimatePresence>
//           {showCreate && (
//             <motion.div
//               className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowCreate(false)}
//             >
//               <motion.div
//                 onClick={(e) => e.stopPropagation()}
//                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
//                 className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
//               >
//                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-2xl font-bold text-white flex items-center gap-2">
//                     <Sparkles className="text-indigo-400" />
//                     Create Staff
//                   </h3>
//                   <button
//                     onClick={() => setShowCreate(false)}
//                     className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
//                   >
//                     <XCircle className="w-6 h-6" />
//                   </button>
//                 </div>
//                 <CreateStaff
//                   onSuccess={() => {
//                     fetchStaff();
//                     setShowCreate(false);
//                   }}
//                 />
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {editingStaff && (
//             <motion.div
//               className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <EditStaff
//                 staff={editingStaff}
//                 onClose={() => setEditingStaff(null)}
//                 onSuccess={() => {
//                   fetchStaff();
//                   setEditingStaff(null);
//                 }}
//               />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  CartesianGrid,
} from "recharts";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Clock,
  Briefcase,
  Mail,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Activity,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Layers,
  Bell,
  Download,
} from "lucide-react";
import { deleteStaff } from "../../services/adminService";
import CreateStaff from "./CreateStaff";
import EditStaff from "./EditStaff";
import api from "../../services/api";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const StaticCard = ({ children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [llmData, setLlmData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [workload, setWorkload] = useState([]);
  const [topStaff, setTopStaff] = useState([]);
  const [avgTime, setAvgTime] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const SLA_MINUTES = { Critical: 60, High: 120, Medium: 360, Low: 1440 };

  const isSlaBreached = (t) => {
    if (!t?.createdAt) return false;
    if (t.status === "Resolved" || t.status === "Closed") return false;
    const mins = SLA_MINUTES[t.priority] ?? 1440;
    const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
    return ageMin > mins;
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get("/admin/staff", authHeader());
      setStaff(res.data || []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // const fetchTickets = async () => {
  //   try {
  //     const res = await api.get("/admin/incidents", authHeader());
  //     setTickets(Array.isArray(res.data) ? res.data : []);
  //   } catch (err) {
  //     console.error("Failed to fetch tickets", err);
  //   }
  // };
const fetchTickets = async (pageNum = 1, searchQuery = search) => {
  try {
    const res = await api.get(
      `/admin/incidents?page=${pageNum}&limit=20&search=${searchQuery}`,
      authHeader()
    );
    setTickets(res.data.incidents || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    console.error("Failed to fetch tickets", err);
  }
};

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get("/admin/audit-logs", authHeader());
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  const fetchLlmAccuracy = async () => {
    try {
      const res = await api.get("/admin/llm-accuracy", authHeader());
      setLlmData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch LLM data", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats", authHeader());
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

useEffect(() => {
  Promise.all([
    fetchStaff(),
    fetchTickets(),
    fetchAuditLogs(),
    fetchLlmAccuracy(),
    fetchStats(),
  ]);
    api.get("/admin/stats/incidents-by-dept", authHeader()).then((res) => setDeptStats(res.data || []));
api.get("/admin/stats/avg-resolution", authHeader())
  .then((res) => {
    const data = res.data;
    setAvgTime(
      data?.avgMinutes ??
      data?.avgResolutionTime ??
      data?.avgTime ??
      0
    );
  })
  .catch(() => setAvgTime(0));    api.get("/admin/stats/staff-workload", authHeader()).then((res) => setWorkload(res.data || []));
    api.get("/admin/stats/active-staff", authHeader()).then((res) => setTopStaff(res.data || []));
  }, []);

  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    const s = socketRef.current;

    const push = (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 20));
      toast.success(n.message || "New notification");
    };

    s.on("connect", () => {
      s.emit("join_room", { role: "admin" });
    });

    s.on("notification", push);
    s.on("ticket_created", () => {
      fetchTickets();
      push({ message: "New ticket created" });
    });
    s.on("ticket_department_updated", () => {
      fetchTickets();
      push({ message: "Ticket department updated" });
    });
    s.on("ticket_assigned", () => {
      fetchTickets();
      push({ message: "Ticket assigned" });
    });
    s.on("sla_breach", (data) => {
      push({ message: `SLA breached: ${data?.title || "Unknown ticket"}` });
    });
    s.on("stats:update", (data) => {
      setStats(data);
    });

    return () => {
      s.off("notification", push);
      s.off("ticket_created");
      s.off("ticket_department_updated");
      s.off("ticket_assigned");
      s.off("sla_breach");
      s.off("stats:update");
return () => {
  s.removeAllListeners();
  s.disconnect();
};    };
  }, []);

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      await deleteStaff(id);
      fetchStaff();
      toast.success("Staff deleted");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
  };

  const toggleActive = async (id, isActive) => {
    try {
      const url = isActive
        ? `/admin/staff/${id}/deactivate`
        : `/admin/staff/${id}/activate`;

      await api.put(url, {}, authHeader());
      fetchStaff();
      toast.success(isActive ? "Staff deactivated" : "Staff activated");
    } catch (err) {
      toast.error("Failed to update staff status");
      console.error(err);
    }
  };

  const overrideDepartment = async (id, department) => {
    try {
      const res = await api.post(
        `/admin/reassign-department/${id}`,
        { department },
        authHeader()
      );

      setTickets((prev) =>
        prev.map((t) => (t._id === id ? res.data.incident : t))
      );

      toast.success("Department overridden");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to override department");
      console.error(err);
    }
  };

  const exportTicketsCsv = () => {
    if (!tickets.length) {
      toast.error("No tickets to export");
      return;
    }

    const rows = tickets.map((t) => ({
      id: t._id,
      title: t.title,
      department: t.department,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedTo?.full_name || "",
      createdBy: t.createdBy?.username || "",
      createdAt: t.createdAt,
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const staffPerformance = useMemo(() => {
    if (!staff.length || !tickets.length) return [];

    const statsMap = new Map();

    staff.forEach((s) => {
      statsMap.set(String(s._id), {
        _id: s._id,
        full_name: s.full_name,
        email: s.email,
        department: s.department,
        assigned: 0,
        resolved: 0,
        open: 0,
        breached: 0,
        totalResolutionMinutes: 0,
        avgResolutionMinutes: 0,
        resolutionRate: 0,
        feedbackCount: 0,
        totalRating: 0,
        avgRating: 0,
        resolvedCompletelyYes: 0,
        recommendYes: 0,
        positiveBehavior: 0,
        fastResponse: 0,
        resolvedCompletelyPct: 0,
        recommendPct: 0,
        behaviorPct: 0,
        fastResponsePct: 0,
        comments: [],
        score: 0,
      });
    });

    tickets.forEach((t) => {
      const assignedId =
        typeof t.assignedTo === "object" ? t.assignedTo?._id : t.assignedTo;

      if (!assignedId) return;

      const key = String(assignedId);
      if (!statsMap.has(key)) return;

      const item = statsMap.get(key);
      item.assigned += 1;

      const createdAt = t.createdAt ? new Date(t.createdAt).getTime() : null;
      const resolvedAt = t.resolvedAt || t.updatedAt;

      if (t.status === "Resolved" || t.status === "Closed") {
        item.resolved += 1;
        if (createdAt && resolvedAt) {
          const mins = (new Date(resolvedAt).getTime() - createdAt) / 60000;
          if (mins > 0) item.totalResolutionMinutes += mins;
        }
      } else {
        item.open += 1;
      }

      if (isSlaBreached(t)) {
        item.breached += 1;
      }

      if (t.feedback?.rating) {
        item.feedbackCount += 1;
        item.totalRating += Number(t.feedback.rating);
        if (t.feedback.resolvedCompletely === "Yes") item.resolvedCompletelyYes += 1;
        if (t.feedback.recommendSupport === "Yes") item.recommendYes += 1;
        if (["Excellent", "Good"].includes(t.feedback.staffBehavior)) item.positiveBehavior += 1;
        if (["Very Fast", "Fast"].includes(t.feedback.responseSpeed)) item.fastResponse += 1;
        if (t.feedback.comment?.trim()) {
          item.comments.push({
            comment: t.feedback.comment,
            rating: t.feedback.rating,
            ticketId: t.ticketId,
            submittedAt: t.feedback.submittedAt,
          });
        }
      }
    });

    const result = Array.from(statsMap.values()).map((item) => {
      item.avgResolutionMinutes = item.resolved > 0 ? Math.round(item.totalResolutionMinutes / item.resolved) : 0;
      item.resolutionRate = item.assigned > 0 ? Math.round((item.resolved / item.assigned) * 100) : 0;
      item.avgRating = item.feedbackCount > 0 ? Number((item.totalRating / item.feedbackCount).toFixed(1)) : 0;
      item.resolvedCompletelyPct = item.feedbackCount > 0 ? Math.round((item.resolvedCompletelyYes / item.feedbackCount) * 100) : 0;
      item.recommendPct = item.feedbackCount > 0 ? Math.round((item.recommendYes / item.feedbackCount) * 100) : 0;
      item.behaviorPct = item.feedbackCount > 0 ? Math.round((item.positiveBehavior / item.feedbackCount) * 100) : 0;
      item.fastResponsePct = item.feedbackCount > 0 ? Math.round((item.fastResponse / item.feedbackCount) * 100) : 0;
      item.score = item.resolved * 8 + item.resolutionRate * 2 + item.avgRating * 15 + item.recommendPct - item.open * 3 - item.breached * 8 - Math.floor(item.avgResolutionMinutes / 60);
      return item;
    });

    return result.sort((a, b) => b.score - a.score);
  }, [staff, tickets]);

  const weakStaff = staffPerformance.filter((s) => s.feedbackCount >= 2 && (s.avgRating < 3 || s.recommendPct < 50));
  const excellentStaff = staffPerformance.filter((s) => s.feedbackCount >= 2 && s.avgRating >= 4 && s.recommendPct >= 70);

  const renderAuditMessage = (log) => {
    const ticketShort = log.incidentId ? `#${String(log.incidentId).slice(-4)}` : "";
    const d = log.details || {};

    switch (log.action) {
      case "DEPARTMENT_UPDATED":
        return (
          <>
            changed Ticket {ticketShort} from <span className="text-slate-400">{log.originalDepartment}</span> to <span className="text-white">{log.updatedDepartment}</span>
          </>
        );
      case "TICKET_RESOLVED":
        return <>resolved Ticket {ticketShort}</>;
      case "TICKET_REOPENED":
        return <>reopened Ticket {ticketShort}</>;
      case "TICKET_ASSIGNED":
        return <>assigned Ticket {ticketShort} to <span className="text-white">{d.assignedToName || "staff"}</span></>;
      case "FEEDBACK_SUBMITTED":
        return <>received feedback for Ticket {ticketShort} with rating <span className="text-amber-400">{d.rating}/5</span></>;
      case "STAFF_CREATED":
        return <>created staff <span className="text-white">{d.full_name}</span></>;
      case "STAFF_DELETED":
        return <>deleted staff <span className="text-white">{d.full_name}</span></>;
      case "STAFF_ACTIVATED":
        return <>activated staff <span className="text-white">{d.full_name}</span></>;
      case "STAFF_DEACTIVATED":
        return <>deactivated staff <span className="text-white">{d.full_name}</span></>;
      default:
        return <>performed action: {log.action}</>;
    }
  };

  const approveClose = async (id) => {
    try {
      await api.patch(`/incidents/${id}/approve-close`, {}, authHeader());
      toast.success("Incident close approved");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to approve close");
      console.error(err);
    }
  };

  const rejectClose = async (id) => {
    try {
      await api.patch(`/incidents/${id}/reject-close`, {}, authHeader());
      toast.success("Incident close rejected");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to reject close");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <LayoutDashboard className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                System Operational
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-800" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-4 w-80 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-white">Notifications</h4>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-xl text-sm text-slate-300 border border-slate-700/50">
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">New Staff</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Best Resolution Staff
            </h3>
            {staffPerformance.length === 0 ? (
              <p className="text-slate-400 text-sm">Not enough ticket data available</p>
            ) : (
              <div className="space-y-3">
                {staffPerformance.slice(0, 5).map((s, i) => (
                  <div key={s._id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-white font-semibold">#{i + 1} {s.full_name}</p>
                        <p className="text-xs text-slate-400">{s.department || "No department"}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Score {s.score}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>Assigned: {s.assigned}</div>
                      <div>Resolved: {s.resolved}</div>
                      <div>Open: {s.open}</div>
                      <div>Breached: {s.breached}</div>
                      <div>Rate: {s.resolutionRate}%</div>
                      <div>Time: {s.avgResolutionMinutes}m</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Staff Feedback Analysis
            </h3>
            {staffPerformance.length === 0 ? (
              <p className="text-slate-400 text-sm">No feedback data available</p>
            ) : (
              <div className="space-y-4">
                {staffPerformance.slice(0, 5).map((s, i) => (
                  <div key={s._id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-white font-semibold">#{i + 1} {s.full_name}</p>
                        <p className="text-xs text-slate-400">{s.department || "No department"}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">{s.feedbackCount} feedback</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
                      <div>Rating: {s.avgRating}/5</div>
                      <div>Recommend: {s.recommendPct}%</div>
                      <div>Resolved: {s.resolvedCompletelyPct}%</div>
                      <div>Behavior: {s.behaviorPct}%</div>
                    </div>
                    {s.comments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {s.comments.slice(0, 1).map((c, idx) => (
                          <div key={idx} className="text-xs text-slate-300 bg-slate-900/60 rounded-lg p-2 border border-slate-700">
                            <p className="italic">"{c.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Suggested Admin Action
            </h3>
            <div className="space-y-3">
              {excellentStaff.slice(0, 2).map((s) => (
                <div key={`good-${s._id}`} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-300 font-medium">Reward {s.full_name}</p>
                  <p className="text-xs text-slate-300 mt-1">Rating {s.avgRating}/5, Recommend {s.recommendPct}%</p>
                </div>
              ))}
              {weakStaff.slice(0, 2).map((s) => (
                <div key={`weak-${s._id}`} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-sm text-rose-300 font-medium">Review {s.full_name}</p>
                  <p className="text-xs text-slate-300 mt-1">Rating {s.avgRating}/5, Recommend {s.recommendPct}%</p>
                </div>
              ))}
              {excellentStaff.length === 0 && weakStaff.length === 0 && (
                <p className="text-sm text-slate-400">Not enough feedback for actions.</p>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { label: "Open", value: stats.openIncidents, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Resolved", value: stats.resolvedIncidents, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Closed", value: stats.closedIncidents, icon: XCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Staff", value: stats.totalStaff, icon: Briefcase, color: "text-pink-400", bg: "bg-pink-500/10" },
              { label: "Incidents", value: stats.totalIncidents, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{item.value}</h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-center items-center relative overflow-hidden">
            <Clock className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-5xl font-bold mb-2">
              {avgTime}
              <span className="text-2xl font-normal opacity-70">min</span>
            </h3>
            <p className="text-indigo-200 font-medium text-center">Avg Resolution Time</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              LLM Accuracy
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={llmData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    cursor={{ fill: "#334155", opacity: 0.4 }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Department Load
            </h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptStats}
                    dataKey="count"
                    nameKey="department"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {deptStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="text-indigo-400" />
                  Staff Directory
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{staff.length}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((s) => (
                  <StaticCard key={s._id}>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                      <h4 className="font-bold text-white">{s.full_name}</h4>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {s.email}
                      </p>
<div className="mt-4 flex justify-between items-center">
  <span className="text-xs flex items-center gap-2">
    <Briefcase className="w-3 h-3" />
    {s.department}
  </span>
  {s.isVerified ? (
    <span className="text-emerald-400 text-xs flex items-center gap-1">
      <ShieldCheck className="w-3 h-3" /> Verified
    </span>
  ) : (
    <span className="text-amber-400 text-xs flex items-center gap-1">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )}
</div>

{/* QR Code - separate row */}
<div className="mt-3 flex justify-center">
  {s.qrCode ? (
    <img src={s.qrCode} alt="Staff QR" className="w-24 h-24 rounded-lg" />
  ) : (
    <p className="text-xs text-slate-500">No QR</p>
  )}
</div>
                      <div className="mt-4 flex justify-end gap-4">
                        <button onClick={() => handleEdit(s)} className="text-indigo-400 hover:text-indigo-300">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(s._id, s.isActive)}
                          className={`text-xs px-3 py-1 rounded ${s.isActive ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}
                        >
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </StaticCard>
                ))}
              </div>
            </section>

<section className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
  <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <h3 className="text-xl font-bold text-white flex items-center gap-2">
      <Activity className="text-rose-400" />
      Recent Incidents
    </h3>
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Search tickets..."
        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => {
          setSearch(e.target.value);
          fetchTickets(1, e.target.value);
        }}
      />
      <button
        onClick={exportTicketsCsv}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left whitespace-nowrap">
      <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Title</th>
          <th className="px-6 py-4">Dept</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Assigned</th>
          <th className="px-6 py-4">SLA</th>
          <th className="px-6 py-4">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {tickets.map((t) => (
          <tr key={t._id} className="hover:bg-slate-800/30">
            <td className="px-6 py-4 font-mono text-indigo-400">#{t._id.slice(-4)}</td>
            <td className="px-6 py-4 font-medium text-white">{t.title}</td>
            <td className="px-6 py-4">
              <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">{t.department}</span>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                t.status === "Open" ? "bg-slate-800 border-slate-600 text-slate-300" :
                t.status === "In Progress" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                t.status === "Resolved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}>{t.status}</span>
            </td>
            <td className="px-6 py-4 text-slate-400">
              {t.assignedTo?.full_name || <span className="text-slate-600 italic">Unassigned</span>}
            </td>
            <td className="px-6 py-4">
              {isSlaBreached(t) ? (
                <span className="text-rose-400 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Breached</span>
              ) : (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OK</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-2">
                <select
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={t.department}
                  onChange={(e) => overrideDepartment(t._id, e.target.value)}
                >
                  <option value="IT">IT</option>
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Accounts">Accounts</option>
                  <option value="General">General</option>
                </select>
                {t.status === "Resolved" && (
                  <div className="flex gap-2">
                    <button onClick={() => approveClose(t._id)} className="px-2 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">Approve</button>
                    <button onClick={() => rejectClose(t._id)} className="px-2 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">Reject</button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-between p-4 border-t border-slate-800">
    <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
    <div className="flex gap-2">
      <button
        onClick={() => { setPage(p => p - 1); fetchTickets(page - 1); }}
        disabled={page === 1}
        className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
      >
        Previous
      </button>
      <button
        onClick={() => { setPage(p => p + 1); fetchTickets(page + 1); }}
        disabled={page === totalPages}
        className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</section>
          </div>
{/* <input
  type="text"
  placeholder="Search tickets..."
  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
  onChange={(e) => {
    setSearch(e.target.value);
    fetchTickets(1, e.target.value);
  }}
/>
          <div className="flex items-center justify-between p-4 border-t border-slate-800">
  <p className="text-slate-400 text-sm">
    Page {page} of {totalPages}
  </p>
  <div className="flex gap-2">
    <button
      onClick={() => { setPage(p => p - 1); fetchTickets(page - 1); }}
      disabled={page === 1}
      className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={() => { setPage(p => p + 1); fetchTickets(page + 1); }}
      disabled={page === totalPages}
      className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div> */}

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Current Workload
              </h3>
              <div className="space-y-3">
                {workload.slice(0, 5).map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">{String(w._id).slice(-2)}</div>
                      <span className="text-sm text-slate-300">Staff #{String(w._id).slice(-4)}</span>
                    </div>
                    <span className="font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-md text-xs">{w.openCount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Top Performers
              </h3>
              <div className="space-y-3">
                {topStaff.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-400"}`}>{i + 1}</div>
                      <span className="text-sm text-slate-300">{s.full_name || s.name || "Staff"}</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">{s.count} Resolved</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm flex-1">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" /> Audit Trail
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 text-sm">No logs recorded.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log._id} className="relative pl-4 border-l-2 border-slate-800 pb-4 last:pb-0">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-600 ring-4 ring-slate-900" />
                      <p className="text-sm text-slate-300">
                        <span className="text-indigo-400 font-medium">{log.updatedBy?.username || "System"}</span> {renderAuditMessage(log)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-indigo-400" /> Create Staff
                </h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <CreateStaff onSuccess={() => { fetchStaff(); setShowCreate(false); }} />
            </div>
          </div>
        )}

        {editingStaff && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <EditStaff
              staff={editingStaff}
              onClose={() => setEditingStaff(null)}
              onSuccess={() => { fetchStaff(); setEditingStaff(null); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useEffect, useState, useRef } from "react";
// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   XAxis,
//   CartesianGrid
// } from "recharts";
// import { io } from "socket.io-client";
// import { toast } from "react-hot-toast";
// import {
//   motion,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   AnimatePresence
// } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import {
//   Users,
//   ShieldCheck,
//   Clock,
//   Briefcase,
//   Mail,
//   Sparkles,
//   LayoutDashboard,
//   LogOut,
//   Activity,
//   Pencil,
//   Trash2,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Layers,
//   Bell,
//   Download
// } from "lucide-react";
// import { deleteStaff } from "../../services/adminService";
// import CreateStaff from "./CreateStaff";
// import EditStaff from "./EditStaff";
// import api from "../../services/api";

// // --- Animation Variants ---
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: { type: "spring", stiffness: 100 },
//   },
// };

// const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

// // --- 3D Tilt Card Component ---
// const TiltCard = ({ children, className = "" }) => {
//   const ref = useRef(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
//   const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

//   const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
//   const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

//   const handleMouseMove = (e) => {
//     if (!ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
//     y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => {
//         x.set(0);
//         y.set(0);
//       }}
//       style={{
//         rotateX,
//         rotateY,
//         transformStyle: "preserve-3d",
//         perspective: 1000,
//       }}
//       className={`relative ${className}`}
//     >
//       {children}
//     </motion.div>
//   );
// };

// // --- Main Dashboard Component ---
// export default function AdminDashboard() {
//   // State
//   const [staff, setStaff] = useState([]);
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [showCreate, setShowCreate] = useState(false);
//   const [tickets, setTickets] = useState([]);
//   const [llmData, setLlmData] = useState([]);
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [deptStats, setDeptStats] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [workload, setWorkload] = useState([]);
//   const [topStaff, setTopStaff] = useState([]);
//   const [avgTime, setAvgTime] = useState(0);

//   const navigate = useNavigate();
//   const socketRef = useRef(null);

//   // Helpers
//   const authHeader = () => ({
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   });

//   const SLA_MINUTES = { High: 120, Medium: 360, Low: 1440 };

//   const isSlaBreached = (t) => {
//     if (!t?.createdAt) return false;
//     if (t.status === "Resolved" || t.status === "Closed") return false;
//     const mins = SLA_MINUTES[t.priority] ?? 1440;
//     const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
//     return ageMin > mins;
//   };

//   // Data Fetching
//   const fetchStaff = async () => {
//     try {
//       const res = await api.get("/admin/staff", authHeader());
//       setStaff(res.data || []);
//     } catch (error) {
//       console.error("Failed to fetch staff:", error);
//     }
//   };

//   const fetchTickets = async () => {
//     try {
//       const res = await api.get("/admin/incidents", authHeader());
//       setTickets(res.data);
//     } catch (err) {
//       console.error("Failed to fetch tickets", err);
//     }
//   };

//   const fetchAuditLogs = async () => {
//     try {
//       const res = await api.get("/admin/audit-logs", authHeader());
//       setAuditLogs(res.data);
//     } catch (err) {
//       console.error("Failed to fetch audit logs", err);
//     }
//   };

//   const fetchLlmAccuracy = async () => {
//     try {
//       const res = await api.get("/admin/llm-accuracy", authHeader());
//       setLlmData(res.data);
//     } catch (err) {
//       console.error("Failed to fetch LLM data", err);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const res = await api.get("/admin/stats", authHeader());
//       setStats(res.data);
//     } catch (err) {
//       console.error("Failed to fetch stats", err);
//     }
//   };

//   // Initial Effects
//   useEffect(() => {
//     fetchStaff();
//     fetchTickets();
//     fetchAuditLogs();
//     fetchLlmAccuracy();
//     fetchStats();

//     api.get("/admin/stats/incidents-by-dept", authHeader())
//       .then((res) => setDeptStats(res.data))
//       .catch(console.error);
//     api.get("/admin/stats/avg-resolution", authHeader())
//       .then((res) => setAvgTime(res.data.avgMinutes))
//       .catch(console.error);
//     api.get("/admin/stats/staff-workload", authHeader())
//       .then((res) => setWorkload(res.data))
//       .catch(console.error);
//     api.get("/admin/stats/active-staff", authHeader())
//       .then((res) => setTopStaff(res.data))
//       .catch(console.error);
//   }, []);

//   // Socket.io Logic
//   useEffect(() => {
//     socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
//       transports: ["websocket"],
//       auth: {
//         token: localStorage.getItem("token"),
//       },
//     });

//     const s = socketRef.current;

//     const push = (n) => {
//       setNotifications((prev) => [n, ...prev].slice(0, 20));
//       toast.success(n.message || "New notification");
//     };

//     s.on("connect", () => {
//       console.log("✅ Admin socket connected:", s.id);
//       s.emit("join_room", { role: "admin" });
//     });

//     s.on("notification", push);

//     s.on("ticket_created", () => {
//       fetchTickets();
//       push({ message: "New ticket created" });
//     });

//     s.on("ticket_department_updated", () => {
//       fetchTickets();
//       push({ message: "Ticket department updated" });
//     });

//     s.on("ticket_assigned", () => {
//       fetchTickets();
//       push({ message: "Ticket assigned" });
//     });

//     s.on("sla_breach", (data) => {
//       push({ message: `SLA breached: ${data?.title || "Unknown ticket"}` });
//     });

//     s.on("stats:update", (data) => {
//       setStats(data);
//     });

//     return () => {
//       s.off("notification", push);
//       s.off("ticket_created");
//       s.off("ticket_department_updated");
//       s.off("ticket_assigned");
//       s.off("sla_breach");
//       s.off("stats:update");
//       s.disconnect();
//     };
//   }, []);

//   // Actions
//   const handleLogout = () => {
//     if (socketRef.current) socketRef.current.disconnect();
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this staff member?")) return;
//     try {
//       await deleteStaff(id);
//       fetchStaff();
//       toast.success("Staff deleted");
//     } catch (err) {
//       toast.error("Delete failed");
//       console.error(err);
//     }
//   };

//   const toggleActive = async (id, isActive) => {
//     try {
//       const url = isActive ? `/admin/staff/${id}/deactivate` : `/admin/staff/${id}/activate`;
//       await api.put(url, {}, authHeader());
//       fetchStaff();
//       toast.success(isActive ? "Staff deactivated" : "Staff activated");
//     } catch (err) {
//       toast.error("Failed to toggle status");
//       console.error(err);
//     }
//   };

//   const overrideDepartment = async (id, department) => {
//     try {
//       await api.post(`/admin/reassign-department/${id}`, { department }, authHeader());
//       toast.success("Department overridden");
//       fetchTickets();
//     } catch (err) {
//       toast.error("Failed to override department");
//       console.error(err);
//     }
//   };

//   const exportTicketsCsv = () => {
//     if (!tickets.length) return toast.error("No tickets to export");
//     const rows = tickets.map((t) => ({
//       id: t._id,
//       title: t.title,
//       department: t.department,
//       priority: t.priority,
//       status: t.status,
//       assignedTo: t.assignedTo?.full_name || "",
//       createdBy: t.createdBy?.username || "",
//       createdAt: t.createdAt,
//     }));

//     const headers = Object.keys(rows[0] || {});
//     const csv = [
//       headers.join(","),
//       ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleEdit = (staffMember) => {
//     setEditingStaff(staffMember);
//   };

//   // --- Render ---
//   return (
//     <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] text-slate-200 font-sans selection:bg-indigo-500/30 pb-12">
//       <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        
//         {/* HEADER */}
//         <motion.header 
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-2xl p-6 rounded-3xl relative z-20"
//         >
//           <div className="flex items-center gap-5">
//             <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shadow-inner">
//               <LayoutDashboard className="w-8 h-8 text-indigo-400" />
//             </div>
//             <div>
//               <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
//               <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
//                 </span>
//                 System Operational
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-slate-300 transition-all relative shadow-lg"
//               >
//                 <Bell className="w-5 h-5" />
//                 {notifications.length > 0 && (
//                   <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
//                 )}
//               </button>
//               <AnimatePresence>
//                 {showNotifications && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                     className="absolute right-0 top-full mt-4 w-80 z-50 bg-slate-900/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
//                   >
//                     <div className="p-4 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
//                       <h4 className="font-bold text-white">Notifications</h4>
//                       <button onClick={() => setNotifications([])} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Clear All</button>
//                     </div>
//                     <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
//                       {notifications.length === 0 ? (
//                         <p className="text-slate-500 text-sm text-center py-6">No new notifications</p>
//                       ) : (
//                         notifications.map((n, i) => (
//                           <div key={i} className="p-3 bg-white/[0.03] rounded-xl text-sm text-slate-300 border border-white/[0.02] hover:bg-white/[0.06] transition-colors">
//                             {n.message}
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <button
//               onClick={() => setShowCreate(true)}
//               className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md text-white font-medium transition-all shadow-lg shadow-indigo-500/25 border border-indigo-500/50"
//             >
//               <Sparkles className="w-4 h-4" />
//               <span className="hidden sm:inline">New Staff</span>
//             </button>

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium transition-all border border-rose-500/20 shadow-lg"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="hidden sm:inline">Logout</span>
//             </button>
//           </div>
//         </motion.header>

//         {/* STATS GRID */}
//         {stats && (
//           <motion.div 
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
//           >
//             {[ 
//               { label: "Total Users", value: stats.totalUsers, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/20", border: "border-indigo-500/20" },
//               { label: "Open", value: stats.openIncidents, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/20" },
//               { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/20" },
//               { label: "Resolved", value: stats.resolvedIncidents, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/20" },
//               { label: "Closed", value: stats.closedIncidents, icon: XCircle, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/20" },
//               { label: "Staff", value: stats.totalStaff, icon: Briefcase, color: "text-pink-400", bg: "bg-pink-500/20", border: "border-pink-500/20" },
//               { label: "Incidents", value: stats.totalIncidents, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/20" },
//             ].map((item, i) => (
//               <motion.div
//                 key={i}
//                 variants={itemVariants}
//                 className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between hover:bg-white/[0.04] transition-all shadow-xl group relative overflow-hidden"
//               >
//                 <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 ${item.bg}`}></div>
//                 <div className="flex justify-between items-start mb-3 relative z-10">
//                   <div className={`p-2.5 rounded-xl border ${item.bg} ${item.border}`}>
//                     <item.icon className={`w-5 h-5 ${item.color}`} />
//                   </div>
//                 </div>
//                 <div className="relative z-10">
//                   <h3 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left tracking-tight">{item.value}</h3>
//                   <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">{item.label}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* CHARTS ROW */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Avg Time Card */}
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="bg-gradient-to-br from-indigo-600/90 to-violet-800/90 backdrop-blur-xl rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-center items-center relative overflow-hidden border border-indigo-500/30"
//           >
//             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
//             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
//             <Clock className="w-12 h-12 mb-4 opacity-90 relative z-10 drop-shadow-lg" />
//             <h3 className="text-6xl font-extrabold mb-2 relative z-10 tracking-tighter drop-shadow-md">
//               {avgTime}<span className="text-2xl font-medium opacity-70 ml-1">min</span>
//             </h3>
//             <p className="text-indigo-200 font-medium relative z-10 tracking-wide uppercase text-sm">Avg Resolution Time</p>
//           </motion.div>

//           {/* LLM Accuracy */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden"
//           >
//             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
//             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
//               <Sparkles className="w-5 h-5 text-indigo-400" /> LLM Accuracy
//             </h3>
//             <div className="h-48 relative z-10">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={llmData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
//                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
//                   <Tooltip 
//                     contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '12px' }}
//                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
//                   />
//                   <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </motion.div>

//           {/* Dept Distribution */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden"
//           >
//             <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
//             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
//               <PieChart className="w-5 h-5 text-emerald-400" /> Department Load
//             </h3>
//             <div className="h-48 flex items-center justify-center relative z-10">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={deptStats}
//                     dataKey="count"
//                     nameKey="department"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                   >
//                     {deptStats.map((_, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0)" />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
//                   <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </motion.div>
//         </div>

//         {/* MAIN CONTENT GRID */}
//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
//           {/* LEFT COLUMN: STAFF & INCIDENTS */}
//           <div className="xl:col-span-2 space-y-8">
            
//             {/* STAFF DIRECTORY */}
//             <section>
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-2xl font-bold text-white flex items-center gap-3">
//                   <Users className="text-indigo-400 w-6 h-6" /> Staff Directory
//                   <span className="bg-white/[0.05] border border-white/[0.1] text-slate-300 text-xs px-3 py-1 rounded-full shadow-inner">{staff.length}</span>
//                 </h3>
//               </div>
              
//               <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {staff.map((s) => (
//                   <TiltCard key={s._id}>
//                     <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 shadow-xl hover:bg-white/[0.04] transition-colors h-full flex flex-col">
//                       <div className="flex-1">
//                         <h4 className="font-bold text-lg text-white tracking-tight">{s.full_name}</h4>
//                         <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
//                           <Mail className="w-3.5 h-3.5 opacity-70" />
//                           {s.email}
//                         </p>

//                         <div className="mt-5 flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
//                           <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
//                             <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
//                             {s.department}
//                           </span>

//                           {s.isVerified ? (
//                             <span className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
//                               <ShieldCheck className="w-3.5 h-3.5" /> Verified
//                             </span>
//                           ) : (
//                             <span className="text-amber-400 text-xs font-medium flex items-center gap-1.5">
//                               <Clock className="w-3.5 h-3.5" /> Pending
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <div className="mt-5 pt-4 border-t border-white/[0.05] flex justify-between items-center">
//                         <button
//                           onClick={() => toggleActive(s._id, s.isActive)}
//                           className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors border ${ 
//                             s.isActive 
//                               ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" 
//                               : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
//                           }`}
//                         >
//                           {s.isActive ? "Deactivate" : "Activate"}
//                         </button>
//                         <div className="flex gap-3">
//                           <button
//                             onClick={() => handleEdit(s)}
//                             className="p-2 rounded-lg bg-white/[0.05] text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
//                           >
//                             <Pencil className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(s._id)}
//                             className="p-2 rounded-lg bg-white/[0.05] text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </TiltCard>
//                 ))}
//               </motion.div>
//             </section>

//             {/* INCIDENTS TABLE */}
//             <section className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
//               <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
//                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                   <Activity className="text-rose-400 w-5 h-5" /> Recent Incidents
//                 </h3>
//                 <button onClick={exportTicketsCsv} className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] rounded-xl text-sm font-medium transition-colors shadow-sm">
//                   <Download className="w-4 h-4" /> Export CSV
//                 </button>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] font-bold tracking-widest">
//                     <tr>
//                       <th className="px-6 py-5">ID</th>
//                       <th className="px-6 py-5">Title</th>
//                       <th className="px-6 py-5">Dept</th>
//                       <th className="px-6 py-5">Status</th>
//                       <th className="px-6 py-5">Assigned</th>
//                       <th className="px-6 py-5">SLA</th>
//                       <th className="px-6 py-5">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-white/[0.05]">
//                     {tickets.map((t) => (
//                       <motion.tr 
//                         key={t._id} 
//                         initial={{ opacity: 0 }} 
//                         whileInView={{ opacity: 1 }} 
//                         viewport={{ once: true }}
//                         className="hover:bg-white/[0.02] transition-colors group"
//                       >
//                         <td className="px-6 py-4 font-mono text-indigo-400/80 text-xs">#{t._id.slice(-4)}</td>
//                         <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">{t.title}</td>
//                         <td className="px-6 py-4">
//                           <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.05] text-xs text-slate-300 font-medium">
//                             {t.department}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ 
//                             t.status === "OPEN" ? "bg-slate-800/50 border-slate-600/50 text-slate-300" :
//                             t.status === "IN_PROGRESS" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
//                             t.status === "RESOLVED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
//                             "bg-purple-500/10 border-purple-500/20 text-purple-400"
//                           }`}>
//                             {t.status.replace("_", " ")}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-slate-400 text-xs">
//                           {t.assignedTo?.full_name || <span className="text-slate-500 italic">Unassigned</span>}
//                         </td>
//                         <td className="px-6 py-4">
//                           {isSlaBreached(t) ? (
//                             <span className="text-rose-400 text-xs font-bold flex items-center gap-1.5 bg-rose-500/10 px-2 py-1 rounded-md w-fit"><AlertCircle className="w-3.5 h-3.5" /> Breached</span>
//                           ) : (
//                             <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md w-fit"><CheckCircle className="w-3.5 h-3.5" /> OK</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4">
//                           <select
//                             className="bg-slate-900/50 border border-white/[0.1] text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
//                             value={t.department}
//                             onChange={(e) => overrideDepartment(t._id, e.target.value)}
//                           >
//                             <option>IT</option>
//                             <option>Network</option>
//                             <option>Hardware</option>
//                             <option>Security</option>
//                             <option>General</option>
//                           </select>
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </section>
//           </div>

//           {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
//           <div className="space-y-6">
            
//             {/* WORKLOAD */}
//             <motion.div 
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl"
//             >
//               <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
//                 <Briefcase className="w-5 h-5 text-blue-400" /> Current Workload
//               </h3>
//               <div className="space-y-3">
//                 {workload.slice(0, 5).map((w, i) => (
//                   <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl border border-white/[0.02]">
//                     <div className="flex items-center gap-3">
//                       <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shadow-inner">
//                         {String(w._id).slice(-2)}
//                       </div>
//                       <span className="text-sm font-medium text-slate-300">Staff #{String(w._id).slice(-4)}</span>
//                     </div>
//                     <span className="font-bold text-white bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs shadow-sm">
//                       {w.openCount}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* TOP PERFORMERS */}
//             <motion.div 
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.1 }}
//               className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl"
//             >
//               <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-amber-400" /> Top Performers
//               </h3>
//               <div className="space-y-3">
//                 {topStaff.map((s, i) => (
//                   <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl border border-white/[0.02]">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shadow-inner ${ 
//                         i === 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
//                         i === 1 ? 'bg-slate-300/10 border-slate-300/20 text-slate-300' :
//                         i === 2 ? 'bg-amber-700/10 border-amber-700/20 text-amber-600' :
//                         'bg-white/[0.05] border-white/[0.05] text-slate-400'
//                       }`}>
//                         #{i + 1}
//                       </div>
//                       <span className="text-sm font-medium text-slate-300">{s.full_name || s.name || "Staff"}</span>
//                     </div>
//                     <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
//                       {s.count} Resolved
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* AUDIT LOGS */}
//             <motion.div 
//               initial={{ x: 20, opacity: 0 }}
//               whileInView={{ x: 0, opacity: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: 0.2 }}
//               className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl flex-1"
//             >
//               <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
//                 <Layers className="w-5 h-5 text-slate-400" /> Audit Trail
//               </h3>
//               <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//                 {auditLogs.length === 0 ? (
//                   <p className="text-slate-500 text-sm italic">No logs recorded.</p>
//                 ) : (
//                   auditLogs.map((log) => (
//                     <div key={log._id} className="relative pl-5 border-l-2 border-white/[0.1] pb-1 last:pb-0">
//                       <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-[#0f172a]" />
//                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
//                         {new Date(log.createdAt).toLocaleString()}
//                       </p>
//                       <p className="text-sm text-slate-300 leading-relaxed">
//                         <span className="text-indigo-400 font-semibold">{log.updatedBy?.username || "System"}</span> changed Ticket <span className="font-mono text-slate-400">#{String(log.incidentId).slice(-4)}</span> from <span className="text-slate-400 line-through decoration-slate-600">{log.originalDepartment}</span> to <span className="text-white font-medium bg-white/[0.05] px-1.5 py-0.5 rounded">{log.updatedDepartment}</span>
//                       </p>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </motion.div>

//           </div>
//         </div>

//         {/* CREATE STAFF MODAL */}
//         <AnimatePresence>
//           {showCreate && (
//             <motion.div
//               className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowCreate(false)}
//             >
//               <motion.div
//                 onClick={(e) => e.stopPropagation()}
//                 initial={{ scale: 0.95, opacity: 0, y: 20 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.95, opacity: 0, y: 20 }}
//                 className="w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
//               >
//                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-2xl font-bold text-white flex items-center gap-2">
//                     <Sparkles className="text-indigo-400" /> Create Staff
//                   </h3>
//                   <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/[0.1] rounded-full text-slate-400 hover:text-white transition-colors">
//                     <XCircle className="w-6 h-6" />
//                   </button>
//                 </div>
//                 <CreateStaff onSuccess={() => { fetchStaff(); setShowCreate(false); }} />
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* EDIT STAFF MODAL */}
//         <AnimatePresence>
//           {editingStaff && (
//             <motion.div
//               className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <motion.div
//                 initial={{ scale: 0.95, opacity: 0, y: 20 }}
//                 animate={{ scale: 1, opacity: 1, y: 0 }}
//                 exit={{ scale: 0.95, opacity: 0, y: 20 }}
//                 className="w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/[0.1] rounded-3xl shadow-2xl relative overflow-hidden"
//               >
//                  <EditStaff
//                   staff={editingStaff}
//                   onClose={() => setEditingStaff(null)}
//                   onSuccess={fetchStaff}
//                 />
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//       </div>
//     </div>
//   );
// }
