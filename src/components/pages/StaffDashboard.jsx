import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Bot,
  FileText,
  MessageSquare,
  Send,
  LogOut,
  ChevronDown,
  Bell
} from "lucide-react";
import { getSocket } from "./Socket.js";
import { useAuth } from "../context/AuthContext.jsx";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function StaffDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState({});
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    socket.on("ticket_created", fetchTickets);
    socket.on("ticket_assigned", fetchTickets);
    socket.on("ticket_department_updated", fetchTickets);
    socket.on("ticket_resolved", fetchTickets);

    return () => {
      socket.off("notification");
      socket.off("ticket_created", fetchTickets);
      socket.off("ticket_assigned", fetchTickets);
      socket.off("ticket_department_updated", fetchTickets);
      socket.off("ticket_resolved", fetchTickets);
    };
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.tickets);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };
  const getAiSuggestion = async (ticket) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/suggest-resolution`,
        // `${import.meta.env.VITE_API_URL}/api/ai/suggest-resolution`,
        {
          title: ticket.title,
          description: ticket.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAiSuggestion((prev) => ({
        ...prev,
        [ticket._id]: res.data.suggestion,
      }));
    } catch (err) {
      console.error("AI ERROR:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/incidents/${id}/status`,
      // `${import.meta.env.VITE_API_URL}/api/incidents/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("UPDATE STATUS RESPONSE:", res.data);
    fetchTickets();
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    console.log("BACKEND ERROR:", err?.response?.data);
    alert(err?.response?.data?.message || "Failed to update status");
  }
};

  const downloadReport = async (ticketId) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/report`,
      // `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/report`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ticket-${ticketId}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  const addComment = async (ticketId) => {
    const token = localStorage.getItem("token");
    if (!commentText[ticketId]) return;

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/comment`,
      // `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/comment`,
      { message: commentText[ticketId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCommentText((prev) => ({ ...prev, [ticketId]: "" }));
    fetchTickets();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "In Progress":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "Closed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Closed
          </span>
        );
      case "Reopened":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Reopened
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Open
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 pb-12">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
          >
            Staff Dashboard
          </motion.h1>

          <div className="flex items-center gap-4">
            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 transition-all">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white leading-none">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-none">
                    {user?.department}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                <div className="p-4 border-b border-white/10">
                  <p className="text-white font-semibold">{user?.full_name}</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => navigate("/staff/profile")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" /> View Profile
                  </button>
                  <button
                    onClick={logoutUser}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Toast Area */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-slate-800/90 backdrop-blur-md border-l-4 border-green-500 p-4 rounded-r-lg shadow-2xl flex gap-3"
            >
              <div className="bg-green-500/20 p-2 rounded-full h-fit">
                <Bell className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{n.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Assigned Tickets</h2>
          <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-slate-400 border border-white/10">
            Total: {tickets.length}
          </span>
        </div>

        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg">No tickets assigned yet.</p>
            <p className="text-slate-600 text-sm">Enjoy your free time!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                variants={itemVariants}
                className="group bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-white/5">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                      {ticket.department}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        ticket.priority === "High"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : ticket.priority === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* AI Section */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> AI Assistant
                      </span>
                      <button
                        onClick={() => getAiSuggestion(ticket)}
                        className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-2 py-1 rounded transition-colors"
                      >
                        Generate Suggestion
                      </button>
                    </div>
                    {aiSuggestion[ticket._id] ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-slate-300 bg-purple-500/5 p-2 rounded border border-purple-500/10"
                      >
                        {aiSuggestion[ticket._id]}
                      </motion.div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">
                        No suggestion generated yet.
                      </p>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="flex-1 min-h-[100px] flex flex-col">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Activity Log
                    </h4>
                    <div className="flex-1 bg-slate-950/30 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                      {ticket.comments?.length > 0 ? (
                        ticket.comments.map((c, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-bold text-indigo-400">
                              {c.role}:
                            </span>{" "}
                            <span className="text-slate-300">{c.message}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-600 text-center py-2">
                          No comments yet.
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={commentText[ticket._id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [ticket._id]: e.target.value,
                          }))
                        }
                        placeholder="Add a note..."
                        className="w-full bg-slate-950 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addComment(ticket._id);
                        }}
                      />
                      <button
                        onClick={() => addComment(ticket._id)}
                        className="absolute right-1 top-1 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-950/30 border-t border-white/5 grid grid-cols-2 gap-2">
  {(ticket.status === "Open" || ticket.status === "Reopened") && (
    <button
      onClick={() => updateStatus(ticket._id, "In Progress")}
      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded-lg border border-blue-600/20 transition-all"
    >
      <Loader2 className="w-3.5 h-3.5" /> Start Work
    </button>
  )}

  {ticket.status === "In Progress" && (
    <button
      onClick={() => updateStatus(ticket._id, "Resolved")}
      className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-600/20 transition-all"
    >
      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
    </button>
  )}

  <button
    onClick={() => downloadReport(ticket._id)}
    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-white/5 transition-all"
  >
    <FileText className="w-3.5 h-3.5" /> Download Report
  </button>
</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
