  import { Bar, BarChart } from "recharts";
  import { io } from "socket.io-client";
  import { toast } from "react-hot-toast";
  import React, { useEffect, useState, useRef } from "react";
  import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
  import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
  } from "framer-motion";
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
  } from "lucide-react";
  import { deleteStaff } from "../../services/adminService";
  import CreateStaff from "./CreateStaff";
  import EditStaff from "./EditStaff";
  import api from "../../services/api";

  /* ---------------- 3D TILT CARD ---------------- */
  const TiltCard = ({ children, className = "" }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
      y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  };
  /* ---------------- MAIN COMPONENT ---------------- */
  export default function AdminDashboard() {
    const [staff, setStaff] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const navigate = useNavigate();
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

      const deptData = deptStats;
      const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
      const [avgTime, setAvgTime] = useState(0);
      const chartData = llmData;
      const socketRef = useRef(null);

      useEffect(() => {
  socketRef.current = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("token"),
    },
  });

  socketRef.current.emit("join_room", { role: "admin" });

  socketRef.current.on("ticket_created", fetchTickets);
  socketRef.current.on("ticket_department_updated", fetchTickets);
  socketRef.current.on("stats:update", (data) => setStats(data));

  return () => {
    socketRef.current.disconnect();
  };
}, []);

    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/admin/staff", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStaff(res.data || []);
      } catch (error) {
        console.error(
          "Failed to fetch staff:",
          error.response?.data || error.message
        );
      }
    };

    useEffect(() => {
      fetchStaff();
    }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/admin/incidents", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

    const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

    const fetchLlmAccuracy = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get("/admin/llm-accuracy", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLlmData(res.data);
  };

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  useEffect(() => {
    api.get("/admin/stats/incidents-by-dept", authHeader())
      .then(res => setDeptStats(res.data));
  }, []);

  useEffect(() => {
    fetchLlmAccuracy();
  }, []);

const handleLogout = () => {
  if (socketRef.current) {
    socketRef.current.disconnect();
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");
};

  const SLA_MINUTES = { High: 120, Medium: 360, Low: 1440 };

const isSlaBreached = (t) => {
  if (!t?.createdAt) return false;
  if (t.status === "Resolved" || t.status === "Closed") return false;
  const mins = SLA_MINUTES[t.priority] ?? 1440;
  const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
  return ageMin > mins;
};

    const handleEdit = (staff) => {
      setEditingStaff(staff);
    };

    const handleDelete = async (id) => {
      if (!window.confirm("Delete this staff member?")) return;

      try {
        await deleteStaff(id);
        fetchStaff();
      } catch (err) {
        alert("Delete failed");
        console.error(err);
      }
    };
    //   const socket = io("http://localhost:5000", {
    //   transports: ["websocket"],
    //   auth: {
    //     token: localStorage.getItem("token"),
    //   },
    // });     
  // useEffect(() => {

  //   socket.emit("join_room", { role: "admin" });

  //   socket.on("ticket_created", fetchTickets);
  //   socket.on("ticket_department_updated", fetchTickets);

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
useEffect(() => {
  if (!socketRef.current) return;

  const s = socketRef.current;

  const push = (n) => {
    setNotifications((prev) => [n, ...prev].slice(0, 20));
    toast.success(n.message || "New notification");
  };

  s.on("notification", push);
  s.on("ticket_created", () => push({ message: "New ticket created" }));
  s.on("ticket_assigned", () => push({ message: "Ticket assigned" }));
  s.on("sla_breach", (data) => push({ message: `SLA breached: ${data.title}` }));

  return () => {
    s.off("notification", push);
    s.off("ticket_created");
    s.off("ticket_assigned");
    s.off("sla_breach");
  };
}, []);

  useEffect(() => {
    api.get("/admin/stats/avg-resolution", authHeader())
      .then(res => setAvgTime(res.data.avgMinutes));
  }, []);

    const overrideDepartment = async (id, department) => {
    const token = localStorage.getItem("token");

  await api.post(
    `/admin/reassign-department/${id}`,
    { department },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

    toast.success("Department overridden");
    fetchTickets();
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats(res.data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="bg-blue-500 rounded-2xl p-6 shadow-lg flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <motion.h3
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold"
        >
          {value}
        </motion.h3>
      </div>
    </motion.div>
  );

useEffect(() => {
  if (!socketRef.current) return;

  const s = socketRef.current;
  s.on("stats:update", (data) => setStats(data));

  return () => s.off("stats:update");
}, []);

      const toggleActive = async (id, isActive) => {
  const token = localStorage.getItem("token");
  const url = isActive ? `/admin/staff/${id}/deactivate` : `/admin/staff/${id}/activate`;
  await api.put(url, {}, { headers: { Authorization: `Bearer ${token}` }});
  fetchStaff();
  toast.success(isActive ? "Staff deactivated" : "Staff activated");
};

  useEffect(() => {
  api.get("/admin/stats/staff-workload", authHeader()).then(res => setWorkload(res.data));
}, []);

    useEffect(() => {
  api.get("/admin/stats/active-staff", authHeader()).then(res => setTopStaff(res.data));
}, []);

    const exportTicketsCsv = () => {
  const rows = tickets.map(t => ({
    id: t._id,
    title: t.title,
    department: t.department,
    priority: t.priority,
    status: t.status,
    assignedTo: t.assignedTo?.full_name || "",
    createdBy: t.createdBy?.username || "",
    createdAt: t.createdAt,
  }));

  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g,'""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `tickets-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-7xl mx-auto p-6">

          {/* HEADER */}
  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">
      <LayoutDashboard className="w-8 h-8 text-indigo-400" />
      <div>
        <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
        <p className="text-slate-400 flex items-center gap-1">
          <Activity className="w-4 h-4" /> System Operational
        </p>
      </div>
    </div>

    {/* RIGHT SIDE BUTTONS */}
    <div className="flex items-center gap-3 justify-end">

      {/* CREATE STAFF */}
      <button
        onClick={() => setShowCreate(true)}
        className="
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          bg-indigo-600 hover:bg-indigo-500
          text-white
          transition
          shadow-md
        "
      >
        <Sparkles className="w-4 h-4" />
        Create Staff
      </button>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          bg-red-500/10 hover:bg-red-500/20
          text-red-400
          transition
        "
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>

<button
  onClick={() => setShowNotifications((v) => !v)}
  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-600 text-white"
>
  Notifications ({notifications.length})
</button>

      {showNotifications && (
  <div className="fixed right-6 top-20 w-[360px] z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-bold">Notifications</h4>
      <button onClick={() => setNotifications([])} className="text-xs text-slate-400 hover:text-white">
        Clear
      </button>
    </div>
    <div className="space-y-2 max-h-[420px] overflow-auto">
      {notifications.length === 0 ? (
        <p className="text-slate-500 text-sm">No notifications</p>
      ) : notifications.map((n, i) => (
        <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-sm">
          {n.message}
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  </header>
  <div className="bg-slate-900 p-5 rounded-xl">
    <p className="text-slate-400 text-sm">Avg Resolution Time</p>
    <h2 className="text-3xl font-bold text-cyan-400">
      {avgTime} min
    </h2>
  </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  {showCreate && (
    <motion.div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-start md:items-center justify-center px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowCreate(false)}
    >
      {/* MODAL */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="
          w-full max-w-lg
          mt-6 md:mt-0
          bg-slate-900
          border border-slate-800
          rounded-2xl
          p-6
          shadow-2xl
        "
      >
        <TiltCard>
          <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-400" />
                Create Staff
              </h3>

              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <CreateStaff
              onSuccess={() => {
                fetchStaff();
                setShowCreate(false);
              }}
            />
          </div>
        </TiltCard>
      </motion.div>
    </motion.div>
  )}
            {/* STAFF LIST */}
            <motion.div className="lg:col-span-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-indigo-400" />
                Staff Directory
                <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">
                  {staff.length}
                </span>
              </h3>
              <motion.div className="mt-12 bg-slate-900 p-6 rounded-xl">
    <h3 className="text-xl font-bold mb-4">LLM Classification Accuracy</h3>

    <BarChart width={400} height={250} data={chartData}>
      <Bar dataKey="count" fill="#6366f1" />
    </BarChart>
  </motion.div>        
  <h1 className="font-bold">Staffs</h1>
              <motion.div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((s) => (
                  <TiltCard key={s._id}>
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

                      <div className="mt-4 flex justify-end gap-4">
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                            <button
  onClick={() => toggleActive(s._id, s.isActive)}
  className={`text-xs px-3 py-1 rounded ${
    s.isActive ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
  }`}
>
  {s.isActive ? "Deactivate" : "Activate"}
</button>
                      </div>
                    </div>
                  </TiltCard>
                ))}
                
              </motion.div>
            </motion.div>
            
          </div>
        </div>
                    <motion.div className="mt-10 bg-slate-900 border border-slate-800 rounded-xl p-6">
  <h3 className="text-xl font-bold mb-4">Staff Workload (Open)</h3>
  <motion.div className="space-y-2">
    {workload.map((w, i) => (
      <div key={i} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg">
        <span className="text-slate-300">StaffId: {String(w._id).slice(-6)}</span>
        <span className="font-bold text-indigo-300">{w.openCount}</span>
      </div>
    ))}
  </motion.div>
</motion.div>
        <motion.div className="mt-10 bg-slate-900 border border-slate-800 rounded-xl p-6">
  <h3 className="text-xl font-bold mb-4">Top 5 Active Staff</h3>
  <motion.div className="space-y-2">
    {topStaff.map((s, i) => (
      <motion.div key={i} className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg">
        <span className="text-white">{s.full_name || s.name || "Staff"}</span>
        <span className="text-slate-300">Resolved: {s.count}</span>
      </motion.div>
    ))}
  </motion.div>
</motion.div>


        {/* EDIT MODAL */}
        {editingStaff && (
          <EditStaff
            staff={editingStaff}
            onClose={() => setEditingStaff(null)}
            onSuccess={fetchStaff}
          />
        )}
        <div className="mt-12">
{stats && (
<motion.div
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10"
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }}
>
    {[
      { label: "Users", value: stats.totalUsers, icon: Layers, color: "text-indigo-400" },
      { label: "Open", value: stats.openIncidents, icon: AlertCircle, color: "text-gray-400" },
      { label: "In Progress", value: stats.inProgressIncidents, icon: Clock, color: "text-blue-400" },
      { label: "Resolved", value: stats.resolvedIncidents, icon: CheckCircle, color: "text-green-400" },
      { label: "Closed", value: stats.closeIncidents, icon: XCircle, color: "text-purple-400" },
      { label: "Staff", value: stats.totalStaff, icon: Briefcase, color: "bg-purple-500"},
      { label: "Total Incident", value: stats.totalIncidents, icon: Activity, color: "bg-red-500"},
    ].map((item, i) => {
      const Icon = item.icon;
      return (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:shadow-lg hover:shadow-indigo-500/10 transition"
        >
          <div>
            <p className="text-slate-400 text-sm">{item.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{item.value}</h3>
          </div>
          <Icon className={`w-8 h-8 ${item.color}`} />
        </div>
      );
    })}
    </motion.div>
)}

<button
  onClick={exportTicketsCsv}
  className="mb-3 bg-emerald-600 hover:bg-emerald-500 text-sm px-4 py-2 rounded-lg"
>
  Export CSV
</button>

<h3 className="text-2xl font-bold mb-4">All Incidents</h3>

<div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
      <tr>
        <th className="px-6 py-4">ID</th>
        <th className="px-6 py-4">Title</th>
        <th className="px-6 py-4">User</th>
        <th className="px-6 py-4">Department</th>
        <th className="px-6 py-4">Assigned</th>
        <th className="px-6 py-4">Status</th>
        <th className="px-6 py-4">Action</th>
        <th className="px-6 py-4">SLA</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-800">
      {tickets.map((t) => (
        <tr key={t._id} className="hover:bg-slate-800 transition">
          <td className="px-6 py-4 text-indigo-400">
            {t._id.slice(-6).toUpperCase()}
          </td>

          <td className="px-6 py-4 font-semibold text-white">
            {t.title}
          </td>

          <td className="px-6 py-4 text-slate-400">
            {t.createdBy?.username}
          </td>

          <td className="px-6 py-4">
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">
              {t.department}
            </span>
          </td>
          <td className="px-6 py-4 text-slate-300">
            {t.assignedTo?.full_name || "Unassigned"}
          </td>

          <td className="px-6 py-4">
            <span
              className={`px-3 py-1 text-xs rounded-full font-semibold
                ${
                  t.status === "OPEN"
                    ? "bg-gray-600"
                    : t.status === "IN_PROGRESS"
                    ? "bg-blue-500"
                    : t.status === "RESOLVED"
                    ? "bg-green-600"
                    : "bg-slate-600"
                }`}
            >
              {t.status}
            </span>
          </td>

          <td className="px-6 py-4 flex gap-2">
            <select
              className="bg-slate-800 text-xs p-2 rounded"
              value={t.department}
              onChange={(e) =>
                overrideDepartment(t._id, e.target.value)
              }
            >
              <option>IT</option>
              <option>Network</option>
              <option>Hardware</option>
              <option>Security</option>
              <option>General</option>
            </select>

            <button
              className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-2 rounded"
              onClick={() =>
                overrideDepartment(t._id, t.department)
              }
            >
              Update
            </button>
          </td>
          {/* <th className="px-6 py-4">SLA</th> */}
<td className="px-6 py-4">
  {isSlaBreached(t) ? (
    <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-300 font-semibold">
      Breached
    </span>
  ) : (
    <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
      On Track
    </span>
  )}
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  </div>
<div className="mt-10 bg-slate-900 border border-slate-800 rounded-xl p-6">
  <h3 className="text-xl font-bold mb-4">Audit Logs</h3>
  <div className="space-y-2 max-h-[350px] overflow-auto">
    {auditLogs.length === 0 ? (
      <p className="text-slate-500 text-sm">No logs</p>
    ) : auditLogs.map((log) => (
      <div key={log._id} className="bg-slate-800/60 p-3 rounded-lg text-sm">
        <div className="text-slate-300">
          Ticket: <span className="text-white">{String(log.incidentId).slice(-6)}</span>
        </div>
        <div className="text-slate-400">
          {log.originalDepartment} → {log.updatedDepartment} • by {log.updatedBy?.username || "admin"}
        </div>
        <div className="text-slate-500 text-xs">
          {new Date(log.createdAt).toLocaleString()}
        </div>
      </div>
    ))}
  </div>
</div>
{deptStats.length > 0 && (
  <BarChart width={450} height={260} data={deptStats}>
    <Bar dataKey="count" />
  </BarChart>
)}
    <PieChart width={300} height={300}>
    <Pie
      data={deptData}
      dataKey="count"
      nameKey="department"
      outerRadius={100}
      label
    >
      {deptData.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>

      </div>
    );
  }
