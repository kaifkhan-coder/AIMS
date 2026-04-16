// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import TicketDetails from "./TicketDetails";
// import { useAuth } from "../context/AuthContext.jsx";
// import axios from "axios";
// import { ToastBar } from "react-hot-toast";

// export default function MyTickets() {
//   const { user, token } = useAuth();

//   const [tickets, setTickets] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [sortBy, setSortBy] = useState("date");
//   const [page, setPage] = useState(1);
//   const [qrModal, setQrModal] = useState(null);
//   const [totalPages, setTotalPages] = useState(1);
//   const [otp, setOtp] = useState({}); 
// const fetchTickets = async (pageNumber = 1) => {
//   try {
//     setLoading(true);
//     setError("");

//     const res = await axios.get(
//       `${import.meta.env.VITE_API_URL}/api/incidents/my?page=${pageNumber}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     console.log("MY TICKETS RESPONSE:", res.data);

//     if (Array.isArray(res.data)) {
//       setTickets(res.data);
//       setTotalPages(1);
//       setSelectedId(res.data?.[0]?._id || null);
//     } else {
//       setTickets(res.data.incidents || []);
//       setTotalPages(res.data.totalPages || 1);
//       setSelectedId(res.data.incidents?.[0]?._id || null);
//     }

//   } catch (err) {
//     console.error("FETCH MY TICKETS ERROR:", err);
//     setError("Failed to fetch tickets");
//   } finally {
//     setLoading(false);
//   }
// };

// useEffect(() => {
//   if (!token || !user) return;
//   fetchTickets(page);
// }, [user, token, page]);

//   const reopenTicket = async (e, ticketId) => {
//     e.stopPropagation();

//     try {
//       const res = await axios.patch(
//         `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/reopen`,
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

//       Toast.success("Ticket reopened successfully");
//     } catch (err) {
//       console.error("REOPEN ERROR:", err);
//       Toast.error(err?.response?.data?.message || "Failed to reopen ticket");
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

//     const verifyOTP = async (id) => {
//       try {
//   await axios.post(
//   `${import.meta.env.VITE_API_URL}/api/incidents/${id}/verify-otp`,
//   { otp: otp[id] },
//   {
//     headers: { Authorization: `Bearer ${token}` },
//   }
// );
//   Toast.success("OTP Verified. Incident marked as resolved.");
//       } catch (err) {
//         Toast.error("Invalid OTP. Please try again.");
//       }
//     };

//   const selectedTicket = tickets.find(t => t._id === selectedId);
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
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))
//               )}
//             </AnimatePresence>
//           </tbody>
//         </table>
//       </div>
//                               <div className="flex items-center justify-between p-4 border-t border-slate-800">
//   <p className="text-slate-400 text-sm">
//     Page {page} of {totalPages}
//   </p>
//   <div className="flex gap-2">
//     <button
//       onClick={() => { setPage(p => p - 1); fetchTickets(page - 1); }}
//       disabled={page === 1}
//       className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
//     >
//       Previous
//     </button>
//     <button
//       onClick={() => { setPage(p => p + 1); fetchTickets(page + 1); }}
//       disabled={page === totalPages}
//       className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50"
//     >
//       Next
//     </button>
//   </div>
// </div>

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
// {selectedTicket && selectedTicket.status === "Resolved" && (
//   <div className="mt-4">
//     <p className="mb-2">{selectedTicket.title}</p>

//     <div className="flex gap-2">
//       <input
//         value={otp[selectedTicket._id] || ""}
//         onChange={(e) =>
//           setOtp((prev) => ({
//             ...prev,
//             [selectedTicket._id]: e.target.value,
//           }))
//         }
//         placeholder="Enter OTP"
//         className="border px-3 py-2 text-black rounded"
//       />

//       <button
//         onClick={() => verifyOTP(selectedTicket._id)}
//         className="bg-green-500 text-white px-4 py-2 rounded"
//       >
//         Verify OTP
//       </button>
//     </div>
//   </div>
// )}
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

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Hash,
  X,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import TicketDetails from "./TicketDetails";

const SkeletonRow = () => (
  <div className="flex items-center space-x-4 px-6 py-4 border-b border-slate-800 animate-pulse">
    <div className="h-4 w-16 bg-slate-800 rounded"></div>
    <div className="flex-1 h-4 bg-slate-800 rounded"></div>
    <div className="h-4 w-20 bg-slate-800 rounded"></div>
    <div className="h-4 w-20 bg-slate-800 rounded"></div>
    <div className="h-4 w-24 bg-slate-800 rounded"></div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-3 w-12 bg-slate-800 rounded"></div>
      <div className="h-3 w-16 bg-slate-800 rounded"></div>
    </div>
    <div className="h-5 w-3/4 bg-slate-800 rounded"></div>
    <div className="flex justify-between pt-2">
      <div className="h-3 w-20 bg-slate-800 rounded"></div>
      <div className="h-3 w-20 bg-slate-800 rounded"></div>
    </div>
  </div>
);

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
  const [otp, setOtp] = useState({});

  const fetchTickets = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/my?page=${pageNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(res.data)) {
        setTickets(res.data);
        setTotalPages(1);
      } else {
        setTickets(res.data.incidents || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("FETCH MY TICKETS ERROR:", err);
      setError("Failed to fetch tickets. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    fetchTickets(page);
  }, [user, token, page]);

  const reopenTicket = async (e, ticketId) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/reopen`,
        { reason: "User reopened the ticket" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, ...res.data.incident } : t))
      );
      toast.success("Ticket reopened successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reopen ticket");
    }
  };

  const verifyOTP = async (id) => {
    if (!otp[id]) return toast.error("Please enter the OTP");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/incidents/${id}/verify-otp`,
        { otp: otp[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("OTP Verified. Incident resolved.");
      fetchTickets(page);
    } catch (err) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets
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
        if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "priority") {
          const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
          return (order[a.priority] || 99) - (order[b.priority] || 99);
        }
        return 0;
      });
  }, [tickets, search, statusFilter, sortBy]);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "Critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Open": return "bg-slate-500/10 text-slate-300 border-slate-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "Closed": return "bg-slate-800 text-slate-500 border-slate-700";
      case "Pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const selectedTicket = tickets.find(t => t._id === selectedId);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-indigo-500/30">
      <Toaster position="top-right" toastOptions={{ className: 'bg-slate-900 text-white border border-slate-800' }} />
      
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              My Incidents
              <span className="text-xs font-normal bg-slate-900 border border-slate-800 px-2 py-1 rounded-md text-slate-500">
                {filteredTickets.length} Found
              </span>
            </h1>
            <p className="text-slate-400 mt-1">Track and manage your service requests in real-time</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Ticket ID or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-72 bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-1">
              <div className="flex items-center gap-1 px-2 text-slate-500">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-sm py-1.5 pr-8 pl-1 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                {['Open', 'In Progress', 'Resolved', 'Closed', 'Pending'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="w-[1px] h-4 bg-slate-800 mx-1" />
              <div className="flex items-center gap-1 px-2 text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm py-1.5 pr-8 pl-1 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="date">Newest</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-4">
             {/* Desktop Skeleton */}
            <div className="hidden lg:block bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
               {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
            {/* Mobile Skeleton */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/5 border border-red-500/10 p-12 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-red-400">Load Error</h3>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={() => fetchTickets(page)} 
              className="mt-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Try Refreshing
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800 border-dashed p-20 rounded-2xl text-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hash className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white">No incidents matching filters</h3>
            <p className="text-slate-500 mt-2">Try clearing search or changing the status filter.</p>
            <button 
              onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
              className="mt-6 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-500 text-[11px] uppercase tracking-widest border-b border-slate-800">
                    <th className="px-6 py-5 font-bold">Ticket ID</th>
                    <th className="px-6 py-5 font-bold">Subject</th>
                    <th className="px-6 py-5 font-bold">Priority</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold">Date Reported</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTickets.map((t) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.4)" }}
                      onClick={() => setSelectedId(t._id)}
                      className="group cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-5 font-mono text-[13px] text-indigo-400">
                        #{t.ticketId || t._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{t.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-tight ${getPriorityStyles(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-tight ${getStatusStyles(t.status)}`}>
                          {t.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500 text-sm">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-3">
                           {(t.status === "Resolved" || t.status === "Closed") && (
                            <button
                              onClick={(e) => reopenTicket(e, t._id)}
                              className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-400/5 px-2 py-1 rounded border border-orange-400/20"
                            >
                              Reopen
                            </button>
                          )}
                          <MoreHorizontal className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedId(t._id)}
                  className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl active:scale-[0.97] transition-all hover:border-slate-700 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded">#{t.ticketId || t._id?.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusStyles(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100 mb-4 line-clamp-2 leading-relaxed">{t.title}</h4>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getPriorityStyles(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 text-[11px] font-medium">
                      <Calendar className="w-3 h-3 mr-1.5 opacity-60" />
                      {formatDate(t.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))} 
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <p className="text-slate-500 text-sm">
                  Showing <span className="text-slate-200 font-semibold">Page {page}</span> of {totalPages}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPage(p => p - 1); fetchTickets(page - 1); }}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium disabled:opacity-20 hover:bg-slate-800 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => { setPage(p => p + 1); fetchTickets(page + 1); }}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium disabled:opacity-20 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Incident Details</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                      #{selectedTicket?.ticketId || selectedId.slice(-8)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
                >
                  <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-8 custom-scrollbar">
                <TicketDetails ticketId={selectedId} />
                
                {selectedTicket && selectedTicket.status === "Resolved" && (
                  <div className="mt-10 pt-8 border-t border-slate-800">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                          Resolution Confirmation
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        The technical team has marked this incident as resolved. Please enter the OTP code provided to you to confirm and close this ticket permanently.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          maxLength="6"
                          value={otp[selectedTicket._id] || ""}
                          onChange={(e) =>
                            setOtp((prev) => ({
                              ...prev,
                              [selectedTicket._id]: e.target.value,
                            }))
                          }
                          placeholder="6-digit OTP"
                          className="flex-grow bg-slate-950 border border-slate-800 px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-center font-mono tracking-widest"
                        />

                        <button
                          onClick={() => verifyOTP(selectedTicket._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                          Verify & Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}
