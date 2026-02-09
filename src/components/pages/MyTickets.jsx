import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TicketDetails from "./TicketDetails";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function MyTickets() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [aiSuggestion, setAiSuggestion] = useState({});
    const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
const [sortBy, setSortBy] = useState("date");

  /* ---------------- FETCH TICKETS ---------------- */

  useEffect(() => {
    if (!token || !user) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/incidents/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("My ticket response", res.data); 
        setTickets(res.data);
        setSelectedId(res.data?.[0]?._id || null);
      } catch (err) {
        setError("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, token]);

  /* ---------------- UI STATES ---------------- */

  if (loading) return <p className="p-4 text-gray-500">Loading tickets...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!tickets.length) return (<div className="bg-amber-50 rounded-xl shadow p-4 text-gray-500">No tickets <br/> Raise a ticket to get started</div>);
  const visibleTickets = showAll ? tickets : tickets.slice(0, 1);

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

  const handleDelete = async (e, ticketId) => {
  e.stopPropagation(); // 🔥 IMPORTANT

  if (!window.confirm("Are you sure you want to delete this ticket?")) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/incidents/${ticketId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setTickets((prev) => prev.filter((t) => t._id !== ticketId));

    if (selectedId === ticketId) {
      setSelectedId(null);
    }
  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert("Failed to delete ticket");
  }
};

const filteredTickets = tickets
  .filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =

      statusFilter === "ALL" || t.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  })
  
  .sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "priority") {
      const order = { High: 1, Medium: 2, Low: 3};
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

return (
  <div className="p-6 bg-slate-950 min-h-screen text-white">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

      <h2 className="text-2xl font-semibold">All Incidents</h2>

      <div className="flex gap-3 flex-wrap">

        {/* 🔎 Search */}
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800 focus:outline-none"
        />

        {/* 📊 Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
        >
          <option value="date">Sort by Date</option>
          <option value="severity">Sort by Priority</option>
        </select>

      </div>
    </div>

    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Reported</th>
          </tr>
        </thead>

<AnimatePresence>
  <tbody className="divide-y divide-slate-800">

    {filteredTickets.length === 0 ? (
      <tr>
        <td colSpan="5" className="text-center py-8 text-slate-400">
          No tickets found for{" "}
          <span className="text-white font-semibold">
            {statusFilter}
          </span>
        </td>
      </tr>
    ) : (
      filteredTickets.map((t) => (
        <motion.tr
          key={t._id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          whileHover={{ backgroundColor: "#0f172a" }}
          onClick={() => setSelectedId(t._id)}
          className="cursor-pointer transition"
        >
          <td className="px-6 py-4 text-indigo-400 font-medium">
            {t.ticketId || t._id.slice(-6).toUpperCase()}
          </td>

          <td className="px-6 py-4">{t.title}</td>

          <td className="px-6 py-4">
            <span
              className={`px-3 py-1 text-xs rounded-full font-semibold
                ${
                  t.priority === "High"
                    ? "bg-red-500 text-white"
                    : t.priority === "Medium"
                    ? "bg-yellow-500 text-black"
                    : "bg-green-500 text-white"
                }`}
            >
              {t.priority}
            </span>
          </td>

          <td className="px-6 py-4">
            <span
              className={`px-3 py-1 text-xs rounded-full
                ${
                  t.status === "OPEN"
                    ? "bg-gray-600"
                    : t.status === "IN_PROGRESS"
                    ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                    : t.status === "RESOLVED"
                    ? "bg-green-600"
                    : "bg-slate-600"
                }`}
            >
              {t.status.replace("_", " ")}
            </span>
          </td>

          <td className="px-6 py-4 text-slate-400">
            {new Date(t.createdAt).toLocaleString()}
          </td>
        </motion.tr>
      ))
    )}

  </tbody>
</AnimatePresence>
      </table>
    </div>

    {/* DETAILS MODAL */}
    <AnimatePresence>
      {selectedId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedId(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 p-6 rounded-xl w-full max-w-2xl"
          >
            <TicketDetails ticketId={selectedId} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
/* ---------------- HELPERS ---------------- */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}