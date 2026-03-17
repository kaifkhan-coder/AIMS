import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import TicketDetails from "./TicketDetails";
import FeedbackForm from "./FeedbackForm";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function MyTickets() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [feedbackTicket, setFeedbackTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    if (!token || !user) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${process.env.BACKEND_URL}/api/incidents/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : [];
        console.log("My ticket response", data);

        setTickets(data);
        setSelectedId(data?.[0]?._id || null);
      } catch (err) {
        console.error("FETCH TICKETS ERROR:", err);
        setError("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, token]);

  const reopenTicket = async (e, id) => {
    e.stopPropagation();

    try {
      const res = await axios.patch(
        `${process.env.BACKEND_URL}/api/incidents/${id}/reopen`,
        { reason: "User reopened the ticket" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets((prev) =>
        prev.map((t) =>
          t._id === id
            ? { ...t, ...(res.data.incident || {}), feedback: null }
            : t
        )
      );

      toast.success("Ticket reopened");
    } catch (err) {
      console.error("REOPEN ERROR:", err);
      toast.error(err?.response?.data?.message || "Failed to reopen ticket");
    }
  };

  const filteredTickets = tickets
    .filter((t) => {
      const matchesSearch =
        (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.ticketId || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || (t.status || "") === statusFilter;

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

  if (loading) return <p className="p-4 text-gray-500">Loading tickets...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  if (!tickets.length) {
    return (
      <div className="bg-amber-50 rounded-xl shadow p-4 text-gray-500">
        No tickets <br /> Raise a ticket to get started
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

          <AnimatePresence>
            <tbody className="divide-y divide-slate-800">
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
                      {t.ticketId || t._id.slice(-6).toUpperCase()}
                    </td>

                    <td className="px-6 py-4">{t.title}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          t.priority === "Critical"
                            ? "bg-red-700 text-white"
                            : t.priority === "High"
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
                        className={`px-3 py-1 text-xs rounded-full ${
                          t.status === "Open"
                            ? "bg-gray-600"
                            : t.status === "In Progress"
                            ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                            : t.status === "Resolved"
                            ? "bg-green-600"
                            : t.status === "Closed"
                            ? "bg-slate-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {(t.status === "Resolved" || t.status === "Closed") &&
                          !t.feedback?.rating && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFeedbackTicket(t);
                              }}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                            >
                              Give Feedback
                            </button>
                          )}

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
            </tbody>
          </AnimatePresence>
        </table>
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

      <AnimatePresence>
        {feedbackTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setFeedbackTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 p-6 rounded-xl w-full max-w-lg"
            >
              <FeedbackForm
                incidentId={feedbackTicket._id}
                onSubmitted={() => {
                  setTickets((prev) =>
                    prev.map((t) =>
                      t._id === feedbackTicket._id
                        ? {
                            ...t,
                            feedback: { rating: 5 },
                          }
                        : t
                    )
                  );
                  setFeedbackTicket(null);
                  toast.success("Feedback submitted");
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import TicketDetails from "./TicketDetails";
// import { useAuth } from "../context/AuthContext.jsx";
// import axios from "axios";

// export default function MyTickets() {
//   const { user, token } = useAuth();

//   const [tickets, setTickets] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
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

//         const res = await axios.get("${process.env.BACKEND_URL}/api/incidents/my", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = Array.isArray(res.data) ? res.data : [];
//         setTickets(data);
//         setSelectedId(data?.[0]?._id || null);
//       } catch (err) {
//         console.error("FETCH MY TICKETS ERROR:", err);
//         setError("Failed to fetch tickets");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTickets();
//   }, [user, token]);

//   const handleDelete = async (e, ticketId) => {
//     e.stopPropagation();

//     if (!window.confirm("Are you sure you want to delete this ticket?")) return;

//     try {
//       await axios.delete(`${process.env.BACKEND_URL}/api/incidents/${ticketId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setTickets((prev) => prev.filter((t) => t._id !== ticketId));

//       if (selectedId === ticketId) {
//         setSelectedId(null);
//       }
//     } catch (err) {
//       console.error("DELETE ERROR:", err);
//       alert("Failed to delete ticket");
//     }
//   };

//   const reopenTicket = async (e, ticketId) => {
//     e.stopPropagation();

//     try {
//       const res = await axios.patch(
//         `${process.env.BACKEND_URL}/api/incidents/${ticketId}/reopen`,
//         { reason: "User reopened the ticket" },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setTickets((prev) =>
//         prev.map((t) =>
//           t._id === ticketId ? { ...t, ...res.data.incident } : t
//         )
//       );

//       alert("Ticket reopened successfully");
//     } catch (err) {
//       console.error("REOPEN ERROR:", err);
//       alert(err?.response?.data?.message || "Failed to reopen ticket");
//     }
//   };

//   const filteredTickets = tickets
//     .filter((t) => {
//       const title = t.title?.toLowerCase() || "";
//       const ticketId = t.ticketId?.toLowerCase() || "";
//       const query = search.toLowerCase();

//       const matchesSearch = title.includes(query) || ticketId.includes(query);
//       const matchesStatus =
//         statusFilter === "ALL" ||
//         (t.status || "").toLowerCase() === statusFilter.toLowerCase();

//       return matchesSearch && matchesStatus;
//     })
//     .sort((a, b) => {
//       if (sortBy === "date") {
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       }

//       if (sortBy === "priority") {
//         const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
//         return (order[a.priority] || 99) - (order[b.priority] || 99);
//       }

//       return 0;
//     });

//   const getPriorityClass = (priority) => {
//     switch (priority) {
//       case "Critical":
//         return "bg-red-700 text-white";
//       case "High":
//         return "bg-red-500 text-white";
//       case "Medium":
//         return "bg-yellow-500 text-black";
//       default:
//         return "bg-green-500 text-white";
//     }
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "Open":
//         return "bg-gray-600 text-white";
//       case "In Progress":
//         return "bg-blue-500 text-white shadow-lg shadow-blue-500/30";
//       case "Resolved":
//         return "bg-green-600 text-white";
//       case "Closed":
//         return "bg-slate-600 text-white";
//       case "Pending":
//         return "bg-amber-500 text-black";
//       default:
//         return "bg-slate-700 text-white";
//     }
//   };

//   if (loading) {
//     return <p className="p-4 text-gray-500">Loading tickets...</p>;
//   }

//   if (error) {
//     return <p className="p-4 text-red-500">{error}</p>;
//   }

//   if (!tickets.length) {
//     return (
//       <div className="bg-amber-50 rounded-xl shadow p-4 text-gray-500">
//         No tickets
//         <br />
//         Raise a ticket to get started
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-slate-950 min-h-screen text-white">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//         <h2 className="text-2xl font-semibold">All Incidents</h2>

//         <div className="flex gap-3 flex-wrap">
//           <input
//             type="text"
//             placeholder="Search tickets..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800 focus:outline-none"
//           />

//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
//           >
//             <option value="ALL">All Status</option>
//             <option value="Open">Open</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Resolved">Resolved</option>
//             <option value="Closed">Closed</option>
//             <option value="Pending">Pending</option>
//           </select>

//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="bg-slate-900 px-4 py-2 rounded-lg text-sm border border-slate-800"
//           >
//             <option value="date">Sort by Date</option>
//             <option value="priority">Sort by Priority</option>
//           </select>
//         </div>
//       </div>

//       <div className="overflow-x-auto rounded-xl border border-slate-800">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
//             <tr>
//               <th className="px-6 py-4">ID</th>
//               <th className="px-6 py-4">Title</th>
//               <th className="px-6 py-4">Priority</th>
//               <th className="px-6 py-4">Status</th>
//               <th className="px-6 py-4">Reported</th>
//               <th className="px-6 py-4">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-800">
//             <AnimatePresence mode="popLayout">
//               {filteredTickets.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="text-center py-8 text-slate-400">
//                     No tickets found for{" "}
//                     <span className="text-white font-semibold">{statusFilter}</span>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredTickets.map((t) => (
//                   <motion.tr
//                     key={t._id}
//                     layout
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0 }}
//                     whileHover={{ backgroundColor: "#0f172a" }}
//                     onClick={() => setSelectedId(t._id)}
//                     className="cursor-pointer transition"
//                   >
//                     <td className="px-6 py-4 text-indigo-400 font-medium">
//                       {t.ticketId || t._id?.slice(-6).toUpperCase()}
//                     </td>

//                     <td className="px-6 py-4">{t.title}</td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs rounded-full font-semibold ${getPriorityClass(
//                           t.priority
//                         )}`}
//                       >
//                         {t.priority}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 text-xs rounded-full ${getStatusClass(
//                           t.status
//                         )}`}
//                       >
//                         {t.status || "Unknown"}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-slate-400">
//                       {formatDate(t.createdAt)}
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex gap-2 flex-wrap">
//                         {(t.status === "Resolved" || t.status === "Closed") && (
//                           <button
//                             onClick={(e) => reopenTicket(e, t._id)}
//                             className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-xs"
//                           >
//                             Reopen
//                           </button>
//                         )}

//                         <button
//                           onClick={(e) => handleDelete(e, t._id)}
//                           className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))
//               )}
//             </AnimatePresence>
//           </tbody>
//         </table>
//       </div>

//       <AnimatePresence>
//         {selectedId && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
//             onClick={() => setSelectedId(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.9 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-slate-900 p-6 rounded-xl w-full max-w-2xl"
//             >
//               <TicketDetails ticketId={selectedId} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function formatDate(dateStr) {
//   if (!dateStr) return "-";
//   const date = new Date(dateStr);
//   return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
// }