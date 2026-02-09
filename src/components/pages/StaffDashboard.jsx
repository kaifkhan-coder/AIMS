import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, CheckCircle2, AlertCircle, Clock, User } from "lucide-react";
import { getSocket } from "./Socket.js"; // single instance
import { useAuth } from "../context/AuthContext.jsx";

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

  // Fetch tickets assigned to this staff
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/incidents/assigned", {
        headers: { Authorization: `Bearer ${token}` }
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
        "http://localhost:5000/api/ai/suggest-resolution",
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

  // Update ticket status
  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/incidents/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchTickets();
  };
  const downloadReport = async (ticketId) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://localhost:5000/api/incidents/${ticketId}/report`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // 🔥 IMPORTANT
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

  if (loading) return <Loader2 className="animate-spin mx-auto mt-20 w-10 h-10" />;

  const addComment = async (ticketId) => {
    const token = localStorage.getItem("token");

    if (!commentText[ticketId]) return;

    await axios.post(
      `http://localhost:5000/api/incidents/${ticketId}/comment`,
      { message: commentText[ticketId] },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setCommentText((prev) => ({ ...prev, [ticketId]: "" }));
    fetchTickets(); // refresh comments
  };

  return (

    <div className="min-h-screen bg-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <div className="relative group">
          <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg text-white border border-white/10 hover:bg-slate-700">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">
              {user?.full_name}
            </span>
          </button>

          {/* DROPDOWN */}
          <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-semibold">{user?.full_name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <p className="text-slate-500 text-xs mt-1">
                Dept: {user?.department}
              </p>
            </div>

            <button
              onClick={() => navigate("/staff/profile")}
              className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              👤 View Profile
            </button>

            <button
              onClick={logoutUser}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="fixed top-4 right-4 max-w-[90vw] sm:max-w-sm space-y-2 z-50">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="bg-slate-800 border border-green-500/40 p-4 rounded-lg shadow-lg text-white"
          >
            <h4 className="font-bold">{n.title}</h4>
            <p className="text-sm text-slate-300">{n.message}</p>
          </div>
        ))}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">My Assigned Tickets</h1>
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <p className="text-slate-400">No tickets assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-white/10 flex flex-col"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">{ticket.title}</h2>
              <p className="text-slate-400 text-sm sm:text-base mb-3 line-clamp-3">{ticket.description}</p>
              <p className="text-sm text-slate-500 mb-3">Department: {ticket.department}</p>
              <p className="text-sm text-slate-500 mb-3">Priority: {ticket.priority}</p>
              <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                Status:
                {ticket.status === "Open" && <Clock className="w-4 h-4 text-yellow-400" />}
                {ticket.status === "In Progress" && <Loader2 className="animate-spin w-4 h-4 text-blue-400" />}
                {ticket.status === "Resolved" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {ticket.status === "Closed" && <AlertCircle className="w-4 h-4 text-red-400" />}
                {ticket.status}
              </p>
              <div className="flex gap-2 mt-3">
                {ticket.status !== "Resolved" && (
                  <button
                    onClick={() => {
                      console.log("RESOLVE TICKET ID:", ticket._id);
                      updateStatus(ticket._id, "Resolved")
                    }}
                    className="px-3 py-1 bg-green-600 rounded text-white text-sm hover:bg-green-500"
                  >
                    Mark Resolved
                  </button>

                )}
                {ticket.status !== "In Progress" && ticket.status !== "Resolved" && (
                  <button
                    onClick={() => updateStatus(ticket._id, "In Progress")}
                    className="px-3 py-1 bg-blue-600 rounded text-white text-sm hover:bg-blue-500"
                  >
                    In Progress
                  </button>
                )}
                <button onClick={() => getAiSuggestion(ticket)} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded text-xs sm:text-sm hover:bg-purple-600/20">
                  🤖 AI Suggest Resolution
                </button>
                {aiSuggestion[ticket._id] && (
                  <div className="mt-3 p-3 bg-slate-900 border border-green-500/30 rounded">
                    <p className="text-green-400 text-sm">
                      🤖 <span className="font-semibold">AI Suggestion:</span><br />
                      {aiSuggestion[ticket._id]}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => downloadReport(ticket._id)}
                  className="px-3 py-1 bg-slate-700 rounded text-white text-sm hover:bg-slate-600"
                >
                  📄 Download Report
                </button>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">
                    💬 Comments
                  </h4>

                  {ticket.comments?.map((c, i) => (
                    <div
                      key={i}
                      className="text-xs bg-slate-700 p-2 rounded mb-1 break-words"
                    >
                      <span className="text-green-400 font-semibold capitalize">
                        {c.role}
                      </span>
                      : {c.message}
                    </div>
                  ))}

                  <textarea
                    value={commentText[ticket._id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [ticket._id]: e.target.value,
                      }))
                    }
                    placeholder="Add work note..."
                    className="w-full mt-2 p-2 rounded bg-slate-900 text-white text-xs sm:text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    onClick={() => addComment(ticket._id)}
                    className="mt-2 w-full sm:w-auto px-3 py-1 bg-indigo-600 text-white rounded text-xs sm:text-sm hover:bg-indigo-500"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
