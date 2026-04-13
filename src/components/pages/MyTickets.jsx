// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-hot-toast";
// import TicketDetails from "./TicketDetails";
// import FeedbackForm from "./FeedbackForm";
// import { useAuth } from "../context/AuthContext.jsx";
// import axios from "axios";

// const STAGGER_CHILDREN = 0.05;

// const STATUS_COLORS = {
//   Open: "bg-blue-100 text-blue-700 border-blue-200",
//   "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
//   Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
//   Closed: "bg-gray-100 text-gray-700 border-gray-200",
//   Pending: "bg-orange-100 text-orange-700 border-orange-200",
// };

// const PRIORITY_COLORS = {
//   Critical: "bg-red-50 text-red-600 border-red-100",
//   High: "bg-orange-50 text-orange-600 border-orange-100",
//   Medium: "bg-blue-50 text-blue-600 border-blue-100",
//   Low: "bg-slate-50 text-slate-600 border-slate-100",
// };

// export default function MyTickets() {
//   const { user, token } = useAuth();
//   const [tickets, setTickets] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [feedbackTicket, setFeedbackTicket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [sortBy, setSortBy] = useState("date");

//   useEffect(() => {
//     if (!token || !user) return;

//     const fetchTickets = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/my`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = Array.isArray(res.data) ? res.data : [];
//         setTickets(data);
//         if (data.length > 0) setSelectedId(data[0]._id);
//       } catch (err) {
//         setError("Failed to fetch tickets from the server.");
//         toast.error("Connection error. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTickets();
//   }, [user, token]);

//   const reopenTicket = async (e, id) => {
//     e.stopPropagation();
//     try {
//       const res = await axios.patch(
//         `${import.meta.env.VITE_API_URL}/api/incidents/${id}/reopen`,
//         { reason: "User requested to reopen the ticket" },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setTickets((prev) =>
//         prev.map((t) => (t._id === id ? { ...t, ...(res.data.incident || {}), feedback: null } : t))
//       );
//       toast.success("Ticket has been reopened.");
//     } catch (err) {
//       toast.error("Failed to reopen ticket.");
//     }
//   };

//   const filteredTickets = tickets
//     .filter((t) => {
//       const matchesSearch =
//         (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
//         (t.ticketId || "").toLowerCase().includes(search.toLowerCase());
//       const matchesStatus = statusFilter === "ALL" || (t.status || "") === statusFilter;
//       return matchesSearch && matchesStatus;
//     })
//     .sort((a, b) => {
//       if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
//       if (sortBy === "priority") {
//         const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
//         return (order[a.priority] || 99) - (order[b.priority] || 99);
//       }
//       return 0;
//     });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex flex-col items-center justify-center">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//           className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
//         />
//         <p className="mt-4 text-gray-600 font-medium tracking-wide">Loading tickets...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <header className="flex items-center justify-between gap-6 mb-8">
//           <div>
//             <motion.h2 
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-3xl font-bold text-gray-900"
//             >
//               Support Tickets
//             </motion.h2>
//             <p className="text-gray-500 mt-1">Manage and track your service requests</p>
//           </div>

//           <div className="flex gap-3">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search tickets..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="bg-white border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 text-sm"
//               />
//             </div>

//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
//             >
//               <option value="ALL">All Statuses</option>
//               <option value="Open">Open</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Resolved">Resolved</option>
//               <option value="Closed">Closed</option>
//             </select>

//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
//             >
//               <option value="date">Sort by: Newest</option>
//               <option value="priority">Sort by: Priority</option>
//             </select>
//           </div>
//         </header>

//         {/* Main Content Area */}
//         <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Ticket ID</th>
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Subject</th>
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Priority</th>
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Date Created</th>
//                 <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               <AnimatePresence mode="popLayout">
//                 {filteredTickets.map((t, index) => (
//                   <motion.tr
//                     key={t._id}
//                     layout
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ delay: index * STAGGER_CHILDREN }}
//                     onClick={() => setSelectedId(t._id)}
//                     className="hover:bg-gray-50 cursor-pointer transition-colors group"
//                   >
//                     <td className="px-6 py-4 font-medium text-blue-600">
//                       #{t.ticketId || t._id.slice(-6).toUpperCase()}
//                     </td>
//                     <td className="px-6 py-4 font-semibold text-gray-900">
//                       {t.title}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${PRIORITY_COLORS[t.priority] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
//                         {t.priority}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${STATUS_COLORS[t.status] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
//                         {t.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-2">
//                         {(t.status === "Resolved" || t.status === "Closed") && !t.feedback?.rating && (
//                           <button
//                             onClick={(e) => { e.stopPropagation(); setFeedbackTicket(t); }}
//                             className="bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 px-3 py-1.5 text-xs font-semibold rounded transition-all"
//                           >
//                             Feedback
//                           </button>
//                         )}
//                         {(t.status === "Resolved" || t.status === "Closed") && (
//                           <button
//                             onClick={(e) => reopenTicket(e, t._id)}
//                             className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold rounded transition-all"
//                           >
//                             Reopen
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//               </AnimatePresence>
//             </tbody>
//           </table>
//           {filteredTickets.length === 0 && (
//             <div className="p-16 text-center text-gray-400">
//               No tickets found matching your current filters.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Ticket Details Modal */}
//       <AnimatePresence>
//         {selectedId && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//             onClick={() => setSelectedId(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
//             >
//               <div className="p-6 overflow-y-auto">
//                 <TicketDetails ticketId={selectedId} />
//               </div>
//               <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
//                 <button 
//                   onClick={() => setSelectedId(null)}
//                   className="px-6 py-2 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Feedback Modal */}
//       <AnimatePresence>
//         {feedbackTicket && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//             onClick={() => setFeedbackTicket(null)}
//           >
//             <motion.div
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 20, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg"
//             >
//               <h3 className="text-xl font-bold mb-2 text-gray-900">Ticket Feedback</h3>
//               <p className="text-gray-500 mb-6 text-sm">How would you rate your experience with ticket #{feedbackTicket.ticketId || feedbackTicket._id.slice(-6).toUpperCase()}?</p>
              
//               <FeedbackForm
//                 incidentId={feedbackTicket._id}
//                 onSubmitted={() => {
//                   setTickets((prev) =>
//                     prev.map((t) => (t._id === feedbackTicket._id ? { ...t, feedback: { rating: 5 } } : t))
//                   );
//                   setFeedbackTicket(null);
//                   toast.success("Thank you for your feedback.");
//                 }}
//               />
              
//               <button 
//                 onClick={() => setFeedbackTicket(null)}
//                 className="mt-4 text-sm text-gray-400 hover:text-gray-600 w-full text-center font-medium"
//               >
//                 Cancel
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <style>{`
//         ::-webkit-scrollbar {
//           width: 8px;
//         }
//         ::-webkit-scrollbar-track {
//           background: #f1f5f9;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 4px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TicketDetails from "./TicketDetails";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function MyTickets() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
useEffect(() => {
  if (!token || !user) return;

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("MY TICKETS RESPONSE:", res.data); // ✅ debug

      // ✅ Handle both formats
      if (Array.isArray(res.data)) {
        setTickets(res.data);
        setTotalPages(1);
        setSelectedId(res.data?.[0]?._id || null);
      } else {
        setTickets(res.data.incidents || []);
        setTotalPages(res.data.totalPages || 1);
        setSelectedId(res.data.incidents?.[0]?._id || null);
      }

    } catch (err) {
      console.error("FETCH MY TICKETS ERROR:", err);
      setError("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  fetchTickets();
}, [user, token]);
  const reopenTicket = async (e, ticketId) => {
    e.stopPropagation();

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/reopen`,
        { reason: "User reopened the ticket" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, ...res.data.incident } : t
        )
      );

      alert("Ticket reopened successfully");
    } catch (err) {
      console.error("REOPEN ERROR:", err);
      alert(err?.response?.data?.message || "Failed to reopen ticket");
    }
  };

  const filteredTickets = tickets
    .filter((t) => {
      const title = t.title?.toLowerCase() || "";
      const ticketId = t.ticketId?.toLowerCase() || "";
      const query = search.toLowerCase();

      const matchesSearch = title.includes(query) || ticketId.includes(query);
      const matchesStatus =
        statusFilter === "ALL" ||
        (t.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "priority") {
        const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
        return (order[a.priority] || 99) - (order[b.priority] || 99);
      }

      return 0;
    });

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-700 text-white";
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-gray-600 text-white";
      case "In Progress":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/30";
      case "Resolved":
        return "bg-green-600 text-white";
      case "Closed":
        return "bg-slate-600 text-white";
      case "Pending":
        return "bg-amber-500 text-black";
      default:
        return "bg-slate-700 text-white";
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-500">Loading tickets...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  if (!tickets.length) {
    return (
      <div className="bg-amber-50 rounded-xl shadow p-4 text-gray-500">
        No tickets
        <br />
        Raise a ticket to get started
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">All Incidents</h2>

        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
          >
            <option value="ALL">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
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
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            <AnimatePresence mode="popLayout">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No tickets found for{" "}
                    <span className="text-white font-semibold">{statusFilter}</span>
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
                      {t.ticketId || t._id?.slice(-6).toUpperCase()}
                    </td>

                    <td className="px-6 py-4">{t.title}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${getPriorityClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusClass(
                          t.status
                        )}`}
                      >
                        {t.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(t.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {(t.status === "Resolved" || t.status === "Closed") && (
                          <button
                            onClick={(e) => reopenTicket(e, t._id)}
                            className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-xs"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
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
</div>

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

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}