import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Activity,
  FileText,
  Gavel,
  SlidersHorizontal,
  RefreshCw,
  Search,
  Filter,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import api from "../../services/api";

/* ---------------- 3D TILT CARD ---------------- */
const TiltCard = ({ children, className = "", onClick }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [slaRules, setSlaRules] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [appealReply, setAppealReply] = useState({});

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filters
  const [userQuery, setUserQuery] = useState("");
  const [incidentQuery, setIncidentQuery] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("ALL");

  // SLA form
  const [slaForm, setSlaForm] = useState({
    severity: "High",
    responseMinutes: 15,
    resolveMinutes: 120,
  });

  // ---------- Fetchers ----------
  const fetchAppeals = async () => {
    const res = await api.get("/account-appeals/all", authHeader());
    setAppeals(res.data || []);
  };

  const fetchStats = async () => {
    const res = await api.get("/superadmin/stats", authHeader());
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get("/superadmin/users", authHeader());
    setUsers(res.data || []);
  };

  const fetchRoleRequests = async () => {
    const res = await api.get("/superadmin/role-requests?status=pending", authHeader());
    setRoleRequests(res.data || []);
  };

  const fetchSlaRules = async () => {
    const res = await api.get("/superadmin/sla-rules", authHeader());
    setSlaRules(res.data || []);
  };

  const fetchIncidents = async () => {
    const res = await api.get("/superadmin/incidents", authHeader());
    setIncidents(res.data || []);
  };

  // const fetchAuditLogs = async () => {
  //   const res = await api.get("/superadmin/audit-logs?limit=80", authHeader());
  //   setAuditLogs(res.data || []);
  // };
  const fetchAuditLogs = async () => {
  try {
    const res = await api.get("/superadmin/audit-logs?limit=80", authHeader());
    console.log("SUPERADMIN AUDIT LOGS:", res.data);
    setAuditLogs(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("SUPERADMIN AUDIT LOG FETCH ERROR:", err);
    toast.error(err?.response?.data?.message || "Failed to fetch audit logs");
  }
};

  const refresh = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") await fetchStats();
      if (activeTab === "users") await fetchUsers();
      if (activeTab === "requests") await fetchRoleRequests();
      if (activeTab === "sla") await fetchSlaRules();
      if (activeTab === "incidents") await fetchIncidents();
      if (activeTab === "audit") await fetchAuditLogs();
      if (activeTab === "appeals") await fetchAppeals();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Socket ----------
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("join_room", { role: "super_admin" });

    const push = (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 20));
      toast.success(n.message || "New notification");
    };

    socketRef.current.on("notification", push);
    socketRef.current.on("incident_created", () => push({ message: "New incident created" }));
    socketRef.current.on("sla_breach", (data) => push({ message: `SLA breached: ${data?.title || ""}` }));
    socketRef.current.on("stats:update", (data) => setStats(data));

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- Actions ----------
  const handleLogout = () => {
    socketRef.current?.disconnect();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const blockUser = async (id) => {
    try {
      const reason = window.prompt("Enter reason for blocking this user:");
      if (!reason || !reason.trim()) {
        toast.error("Block reason is required");
        return;
      }
      setLoading(true);
      await api.patch(`/superadmin/users/${id}/block`, { reason: reason.trim() }, authHeader());
      toast.success("User blocked");
      await fetchUsers();
      await fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/superadmin/users/${id}/unblock`, {}, authHeader());
      toast.success("User unblocked");
      await fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const requestPromoteToAdmin = async (targetUserId) => {
    try {
      setLoading(true);
      await api.post(
        "/superadmin/role-request-by-superadmin",
        {
          targetUserId,
          requestedRole: "admin",
          reason: "Promotion requested by super admin",
        },
        authHeader()
      );
      toast.success("Role request created");
      await fetchRoleRequests();
      setActiveTab("requests");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const approveRoleRequest = async (requestId) => {
    try {
      await api.post(`/superadmin/role-requests/${requestId}/approve`, {}, authHeader());
      toast.success("Approved");
      await fetchRoleRequests();
      await fetchUsers();
      await fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const rejectRoleRequest = async (requestId) => {
    try {
      await api.post(`/superadmin/role-requests/${requestId}/reject`, {}, authHeader());
      toast.success("Rejected");
      await fetchRoleRequests();
      await fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const createSlaRule = async () => {
    try {
      await api.post(
        "/superadmin/sla-rules",
        {
          severity: slaForm.severity,
          responseMinutes: Number(slaForm.responseMinutes),
          resolveMinutes: Number(slaForm.resolveMinutes),
        },
        authHeader()
      );
      toast.success("SLA rule added");
      fetchSlaRules();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const updateSlaRule = async (id, patch) => {
    try {
      await api.patch(`/superadmin/sla-rules/${id}`, patch, authHeader());
      toast.success("SLA rule updated");
      await fetchSlaRules();
      await fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const reviewAppeal = async (appealId, status) => {
    try {
      await api.patch(
        `/account-appeals/${appealId}/review`,
        {
          status,
          adminReply: appealReply[appealId] || "",
        },
        authHeader()
      );
      toast.success(`Appeal ${status.toLowerCase()}`);
      await fetchAppeals();
      await fetchUsers();
      await fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const demoteAdmin = async (id) => {
    try {
      const newRole = window.prompt("Enter new role for this admin: user or staff");

      if (!newRole) return;

      const cleanRole = newRole.trim().toLowerCase();

      if (!["user", "staff"].includes(cleanRole)) {
        toast.error("Only user or staff allowed");
        return;
      }

      setLoading(true);

      const res = await api.patch(
        `/superadmin/users/${id}/demote`,
        { newRole: cleanRole },
        authHeader()
      );

      console.log("DEMOTE RESPONSE:", res.data);
      toast.success(`Admin demoted to ${cleanRole}`);

      await fetchUsers();
      await fetchAuditLogs();
    } catch (e) {
      console.error("DEMOTE ERROR:", e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };
  // ---------- Helpers ----------
  const slaMap = useMemo(() => {
    const map = {};
    for (const r of slaRules) map[r.severity] = r;
    return map;
  }, [slaRules]);

  const isSlaBreached = (t) => {
    if (!t?.createdAt) return false;
    if (t.status === "Resolved" || t.status === "Closed") return false;
    const rule = slaMap[t.priority] || slaMap[t.severity];
    const mins = rule?.resolveMinutes ?? 1440;
    const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
    return ageMin > mins;
  };

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.username, u.email, u.role].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [users, userQuery]);

  const filteredIncidents = useMemo(() => {
    const q = incidentQuery.trim().toLowerCase();
    return incidents
      .filter((i) => (incidentStatus === "ALL" ? true : i.status === incidentStatus))
      .filter((i) => {
        if (!q) return true;
        return [i.title, i.category, i.severity, i.priority, i._id].some((v) =>
          String(v || "").toLowerCase().includes(q)
        );
      });
  }, [incidents, incidentQuery, incidentStatus]);

  const deptPie = useMemo(() => stats?.byDepartment || [], [stats]);
  const severityBars = useMemo(() => stats?.bySeverity || [], [stats]);
  const slaLine = useMemo(() => stats?.slaBreachesByDay || [], [stats]);

  // ---------- UI Components ----------
  const TabButton = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden group
        ${activeTab === tab ? "text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
    >
      {activeTab === tab && (
        <motion.div
          layoutId="activeTabBg"
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">
        <Icon className={`w-5 h-5 ${activeTab === tab ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
        {label}
      </span>
      {activeTab === tab && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 z-10"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </motion.div>
      )}
    </button>
  );

  const MiniStat = ({ label, value, icon: Icon, color = "text-indigo-400" }) => (
    <TiltCard className="h-full">
      <div className="h-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl bg-slate-800/50 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-white/5">
            Live
          </span>
        </div>
        <div className="mt-4">
          <h4 className="text-3xl font-bold text-white tracking-tight">{value ?? 0}</h4>
          <p className="text-slate-400 text-sm font-medium mt-1">{label}</p>
        </div>
      </div>
    </TiltCard>
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto p-4 lg:p-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40" />
              <ShieldCheck className="relative w-12 h-12 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Super Admin <span className="text-indigo-400">Portal</span>
              </h1>
              <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm">
                <Activity className="w-4 h-4 text-emerald-400" /> System Operational • v2.4.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 space-y-2 shadow-2xl shadow-black/20">
                <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Menu
                </div>
                <TabButton tab="overview" icon={LayoutDashboard} label="Overview" />
                <TabButton tab="users" icon={Users} label="Users & Roles" />
                <TabButton tab="requests" icon={Gavel} label="Role Requests" />
                <TabButton tab="sla" icon={SlidersHorizontal} label="SLA Rules" />
                <TabButton tab="incidents" icon={FileText} label="All Incidents" />
                <TabButton tab="audit" icon={Settings} label="Audit Logs" />
                <TabButton tab="appeals" icon={XCircle} label="Blocked Appeals" />
              </div>

              {/* Notification Widget */}
                {/* <div className="mt-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </span>
                      Live Feed
                    </h4>
                    <button onClick={() => setNotifications([])} className="text-xs text-slate-500 hover:text-white transition-colors">
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {notifications.length === 0 ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 text-xs italic">
                          Waiting for events...
                        </motion.p>
                      ) : (
                        notifications.map((n, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-800/50 border border-white/5 rounded-xl p-3 text-xs text-slate-300 shadow-sm"
                          >
                            {n.message}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div> */}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {activeTab === "overview" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <motion.div variants={itemVariants} className="h-full">
                        <MiniStat label="Total Users" value={stats?.totalUsers} icon={Users} color="text-blue-400" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="h-full">
                        <MiniStat label="Total Incidents" value={stats?.totalIncidents} icon={FileText} color="text-purple-400" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="h-full">
                        <MiniStat label="Open Incidents" value={stats?.openIncidents} icon={AlertCircle} color="text-amber-400" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="h-full">
                        <MiniStat label="SLA Breaches" value={stats?.slaBreaches} icon={Clock} color="text-red-400" />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                          <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                          Incidents by Severity
                        </h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={severityBars}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                              <XAxis dataKey="severity" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                                itemStyle={{ color: "#f8fafc" }}
                                cursor={{ fill: "#334155", opacity: 0.2 }}
                              />
                              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                          <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                          Incidents by Department
                        </h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={deptPie}
                                dataKey="count"
                                nameKey="department"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                              >
                                {deptPie.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" }} itemStyle={{ color: "#fff" }} />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl lg:col-span-2">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                          <div className="w-1 h-6 bg-red-500 rounded-full" />
                          SLA Breaches Trend
                        </h3>
                        {slaLine.length === 0 ? (
  <p className="text-slate-500 text-sm">No SLA breach trend data available</p>
) : (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={slaLine}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" }} />
      <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer>
)}
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={slaLine}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" }} />
                              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}

                {activeTab === "users" && (
                  <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-white">Users & Roles</h3>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Search users..."
                          className="w-full md:w-[320px] bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
                        />
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/5">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 font-medium">
                          <tr>
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((u) => (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              key={u._id}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{u.full_name}</div>
                                <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {u.isActive !== false ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Blocked
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {u.isActive !== false ? (
                                    <button
                                      onClick={() => blockUser(u._id)}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                    >
                                      Block
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => unblockUser(u._id)}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    >
                                      Unblock
                                    </button>
                                  )}

                                  {u.role !== "super_admin" && u.role !== "admin" && (
                                    <button
                                      onClick={() => requestPromoteToAdmin(u._id)}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                                    >
                                      Promote
                                    </button>
                                  )}

                                  {u.role === "admin" && (
                                    <button
                                      onClick={() => demoteAdmin(u._id)}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
                                    >
                                      Demote
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === "requests" && (
                  <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6">Role Requests</h3>
                    <div className="overflow-hidden rounded-xl border border-white/5">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 font-medium">
                          <tr>
                            <th className="px-6 py-4">Target User</th>
                            <th className="px-6 py-4">Requested Role</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {roleRequests.map((r) => (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={r._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{r.targetUser?.full_name || "-"}</div>
                                <div className="text-xs text-slate-400">{r.targetUser?.email || ""}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  {r.requestedRole}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-300 italic">"{r.reason || "-"}"</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => approveRoleRequest(r._id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => rejectRoleRequest(r._id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                          {roleRequests.length === 0 && (
                            <tr>
                              <td className="px-6 py-8 text-center text-slate-500" colSpan={4}>
                                No pending requests found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === "sla" && (
                  <div className="space-y-6">
                    <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Configure SLA Rules</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                          className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                          value={slaForm.severity}
                          onChange={(e) => setSlaForm((s) => ({ ...s, severity: e.target.value }))}
                        >
                          <option>Critical</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                        <input
                          className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                          type="number"
                          value={slaForm.responseMinutes}
                          onChange={(e) => setSlaForm((s) => ({ ...s, responseMinutes: e.target.value }))}
                          placeholder="Response (min)"
                        />
                        <input
                          className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                          type="number"
                          value={slaForm.resolveMinutes}
                          onChange={(e) => setSlaForm((s) => ({ ...s, resolveMinutes: e.target.value }))}
                          placeholder="Resolve (min)"
                        />
                        <button
                          onClick={createSlaRule}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                          Add Rule
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                      <h4 className="font-bold text-white mb-4">Active Rules</h4>
                      <div className="overflow-hidden rounded-xl border border-white/5">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                            <tr>
                              <th className="px-6 py-4">Severity</th>
                              <th className="px-6 py-4">Response Time</th>
                              <th className="px-6 py-4">Resolve Time</th>
                              <th className="px-6 py-4">Quick Adjust</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {slaRules.map((r) => (
                              <tr key={r._id} className="hover:bg-white/5">
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                    {r.severity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-300">{r.responseMinutes} min</td>
                                <td className="px-6 py-4 font-mono text-slate-300">{r.resolveMinutes} min</td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => updateSlaRule(r._id, { responseMinutes: Number(r.responseMinutes) + 5 })}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-white/5 transition-colors"
                                    >
                                      +5m Resp
                                    </button>
                                    <button
                                      onClick={() => updateSlaRule(r._id, { resolveMinutes: Number(r.resolveMinutes) + 10 })}
                                      className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-white/5 transition-colors"
                                    >
                                      +10m Rslv
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </div>
                )}

                {activeTab === "incidents" && (
                  <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-bold text-white">Incident Management</h3>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative group flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                          <input
                            value={incidentQuery}
                            onChange={(e) => setIncidentQuery(e.target.value)}
                            placeholder="Search incidents..."
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="relative">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <select
                            className="w-full sm:w-40 bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 appearance-none"
                            value={incidentStatus}
                            onChange={(e) => setIncidentStatus(e.target.value)}
                          >
<option value="ALL">All Status</option>
<option value="Open">Open</option>
<option value="Pending">Pending</option>
<option value="In Progress">In Progress</option>
<option value="Resolved">Resolved</option>
<option value="Closed">Closed</option>
<option value="Reopened">Reopened</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/5">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Dept</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">SLA Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredIncidents.map((t) => (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t._id} className="hover:bg-white/5">
                              <td className="px-6 py-4 font-mono text-xs text-indigo-300">#{String(t._id).slice(-6).toUpperCase()}</td>
                              <td className="px-6 py-4 font-medium text-white">{t.title}</td>
                              <td className="px-6 py-4 text-slate-400">{t.department}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold ${t.priority === "Critical" ? "text-red-400" : "text-slate-300"}`}>
                                  {t.priority || t.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-white/10 text-slate-300">
                                  {t.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {isSlaBreached(t) ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    <AlertCircle className="w-3 h-3" /> Breached
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle className="w-3 h-3" /> On Track
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

  {activeTab === "audit" && (
  <motion.div
    variants={itemVariants}
    className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6"
  >
    <h3 className="text-xl font-bold text-white mb-6">System Audit Logs</h3>

    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {auditLogs.length === 0 ? (
        <p className="text-slate-500 italic">No audit logs found.</p>
      ) : (
        auditLogs.map((log) => (
          <div
            key={log._id}
            className="bg-slate-800/30 border border-white/5 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                {log.action || "ACTION"}
              </span>
              <span className="text-xs text-slate-500">
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
              </span>
            </div>

            <div className="text-sm text-slate-300">
              <span className="text-slate-500">Actor:</span>{" "}
              {log.updatedBy?.username ||
                log.performedBy?.username ||
                log.actor?.username ||
                "System"}
            </div>

            <div className="text-sm text-slate-300 mt-1">
              <span className="text-slate-500">Target:</span>{" "}
              {log.targetUser?.username ||
                log.targetId?.username ||
                log.incidentId?.ticketId ||
                log.incidentId?.title ||
                "-"}
            </div>

            {log.details && (
              <div className="mt-3 bg-black/30 rounded-lg p-3 border border-white/5">
                <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </motion.div>
)}

                {/* {activeTab === "appeals" && (
                  <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Blocked Account Appeals</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {appeals.length === 0 ? (
                        <p className="text-slate-500 italic">No pending appeals.</p>
                      ) : (
                        appeals.map((appeal) => (
                          <div key={appeal._id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-bold text-white">{appeal.user?.username || "Unknown User"}</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                  Submitted: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleString() : ""}
                                </p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Pending Review
                              </span>
                            </div>

                            <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                              <p className="text-sm text-slate-300 italic">"{appeal.reason || "No reason provided"}"</p>
                            </div>

                            <div className="space-y-3">
                              <textarea
                                placeholder="Enter admin reply..."
                                value={appealReply[appeal._id] || ""}
                                onChange={(e) => setAppealReply({ ...appealReply, [appeal._id]: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                                rows={2}
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => reviewAppeal(appeal._id, "approved")}
                                  className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium transition-all"
                                >
                                  Approve Appeal
                                </button>
                                <button
                                  onClick={() => reviewAppeal(appeal._id, "rejected")}
                                  className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-all"
                                >
                                  Reject Appeal
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )} */}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
