import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  Bell,
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
const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

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

    // optional: live stats
    socketRef.current.on("stats:update", (data) => setStats(data));

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // ---------- Fetchers ----------
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

  const fetchAuditLogs = async () => {
    const res = await api.get("/superadmin/audit-logs?limit=80", authHeader());
    setAuditLogs(res.data || []);
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
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

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
      await api.patch(`/superadmin/users/${id}/block`, {}, authHeader());
      toast.success("User blocked");
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const unblockUser = async (id) => {
    try {
      await api.patch(`/superadmin/users/${id}/unblock`, {}, authHeader());
      toast.success("User unblocked");
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const requestPromoteToAdmin = async (targetUserId) => {
    try {
      await api.post(
        "/superadmin/role-requests",
        { targetUserId, requestedRole: "admin", reason: "Promotion requested by super admin" },
        authHeader()
      );
      toast.success("Role request created");
      setActiveTab("requests");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const approveRoleRequest = async (requestId) => {
    try {
      await api.post(`/superadmin/role-requests/${requestId}/approve`, {}, authHeader());
      toast.success("Approved");
      fetchRoleRequests();
      fetchUsers();
      fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const rejectRoleRequest = async (requestId) => {
    try {
      await api.post(`/superadmin/role-requests/${requestId}/reject`, {}, authHeader());
      toast.success("Rejected");
      fetchRoleRequests();
      fetchAuditLogs();
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
      fetchSlaRules();
      fetchAuditLogs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  // ---------- SLA helper for UI ----------
  const slaMap = useMemo(() => {
    // { High: {resolveMinutes, responseMinutes}, ... }
    const map = {};
    for (const r of slaRules) map[r.severity] = r;
    return map;
  }, [slaRules]);

  const isSlaBreached = (t) => {
    if (!t?.createdAt) return false;
    if (t.status === "RESOLVED" || t.status === "CLOSED") return false;
    const rule = slaMap[t.priority] || slaMap[t.severity]; // depending on your field
    const mins = rule?.resolveMinutes ?? 1440;
    const ageMin = (Date.now() - new Date(t.createdAt).getTime()) / 60000;
    return ageMin > mins;
  };

  // ---------- Derived ----------
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

  // ---------- Chart data ----------
  const deptPie = useMemo(() => {
    // expects stats.byDepartment = [{department, count}]
    return stats?.byDepartment || [];
  }, [stats]);

  const severityBars = useMemo(() => {
    // expects stats.bySeverity = [{severity, count}]
    return stats?.bySeverity || [];
  }, [stats]);

  const slaLine = useMemo(() => {
    // expects stats.slaBreachesByDay = [{day, count}]
    return stats?.slaBreachesByDay || [];
  }, [stats]);

  // ---------- UI ----------
  const TabButton = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition
        ${activeTab === tab ? "bg-indigo-600 text-white" : "hover:bg-slate-800 text-slate-300"}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const MiniStat = ({ label, value, icon: Icon }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
    >
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-3xl font-black text-white mt-1">{value ?? 0}</p>
      </div>
      <Icon className="w-7 h-7 text-indigo-400" />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-9 h-9 text-indigo-400" />
            <div>
              <h2 className="text-3xl font-bold text-white">Super Admin Portal</h2>
              <p className="text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Full control • approvals • SLA • audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications ({notifications.length})
            </button>

            <button
              onClick={refresh}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {showNotifications && (
            <div className="fixed right-6 top-20 w-[360px] z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold">Notifications</h4>
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-sm">No notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-sm"
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <TabButton tab="overview" icon={LayoutDashboard} label="Overview" />
              <TabButton tab="users" icon={Users} label="Users & Roles" />
              <TabButton tab="requests" icon={Gavel} label="Role Requests" />
              <TabButton tab="sla" icon={SlidersHorizontal} label="SLA Rules" />
              <TabButton tab="incidents" icon={FileText} label="All Incidents" />
              <TabButton tab="audit" icon={Settings} label="Audit Logs" />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MiniStat label="Total Users" value={stats?.totalUsers} icon={Users} />
                  <MiniStat label="Total Incidents" value={stats?.totalIncidents} icon={FileText} />
                  <MiniStat label="Open Incidents" value={stats?.openIncidents} icon={AlertCircle} />
                  <MiniStat label="SLA Breaches" value={stats?.slaBreaches} icon={Clock} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3">Incidents by Severity</h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={severityBars}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="severity" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3">Incidents by Department</h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={deptPie} dataKey="count" nameKey="department" outerRadius={90} label>
                            {deptPie.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
                    <h3 className="font-bold text-white mb-3">SLA Breaches Trend</h3>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={slaLine}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h3 className="text-xl font-bold text-white">Users & Roles</h3>
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search name / username / email / role..."
                    className="w-full md:w-[360px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{u.full_name}</div>
                            <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.isActive ? (
                              <span className="text-emerald-300 text-xs font-semibold">ACTIVE</span>
                            ) : (
                              <span className="text-red-300 text-xs font-semibold">BLOCKED</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {u.isActive ? (
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
                                  Request Promote → Admin
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-slate-500" colSpan={4}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xl font-bold text-white mb-4">Role Requests (Approval Center)</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Requested Role</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {roleRequests.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{r.targetUser?.full_name || "-"}</div>
                            <div className="text-xs text-slate-400">{r.targetUser?.email || ""}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                              {r.requestedRole}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{r.reason || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveRoleRequest(r._id)}
                                className="px-3 py-2 rounded-lg text-xs bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> Approve
                              </button>
                              <button
                                onClick={() => rejectRoleRequest(r._id)}
                                className="px-3 py-2 rounded-lg text-xs bg-red-500/15 text-red-200 hover:bg-red-500/25 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {roleRequests.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-slate-500" colSpan={4}>
                            No pending requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "sla" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xl font-bold text-white mb-4">SLA Rules</h3>

                  {/* Create */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      value={slaForm.severity}
                      onChange={(e) => setSlaForm((s) => ({ ...s, severity: e.target.value }))}
                    >
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>

                    <input
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      type="number"
                      value={slaForm.responseMinutes}
                      onChange={(e) => setSlaForm((s) => ({ ...s, responseMinutes: e.target.value }))}
                      placeholder="Response minutes"
                    />

                    <input
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      type="number"
                      value={slaForm.resolveMinutes}
                      onChange={(e) => setSlaForm((s) => ({ ...s, resolveMinutes: e.target.value }))}
                      placeholder="Resolve minutes"
                    />

                    <button
                      onClick={createSlaRule}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                      Add Rule
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Best practice: Only <b>super_admin</b> can change SLA rules. Every change goes to audit logs.
                  </p>
                </div>

                {/* List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-bold text-white mb-3">Current SLA Rules</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Severity</th>
                          <th className="px-4 py-3">Response (min)</th>
                          <th className="px-4 py-3">Resolve (min)</th>
                          <th className="px-4 py-3">Quick Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {slaRules.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-800/40">
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                                {r.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">{r.responseMinutes}</td>
                            <td className="px-4 py-3">{r.resolveMinutes}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => updateSlaRule(r._id, { responseMinutes: Number(r.responseMinutes) + 5 })}
                                  className="px-3 py-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700"
                                >
                                  +5 Response
                                </button>
                                <button
                                  onClick={() => updateSlaRule(r._id, { resolveMinutes: Number(r.resolveMinutes) + 10 })}
                                  className="px-3 py-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700"
                                >
                                  +10 Resolve
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {slaRules.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-slate-500" colSpan={4}>
                              No SLA rules found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "incidents" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h3 className="text-xl font-bold text-white">All Incidents</h3>
                  <div className="flex w-full md:w-[520px] gap-2">
                    <input
                      value={incidentQuery}
                      onChange={(e) => setIncidentQuery(e.target.value)}
                      placeholder="Search incident id / title / severity / category..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                    <select
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      value={incidentStatus}
                      onChange={(e) => setIncidentStatus(e.target.value)}
                    >
                      <option value="ALL">All</option>
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredIncidents.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 text-indigo-300 font-mono text-xs">{String(t._id).slice(-6).toUpperCase()}</td>
                          <td className="px-4 py-3 font-semibold text-white">{t.title}</td>
                          <td className="px-4 py-3 text-slate-300">{t.department}</td>
                          <td className="px-4 py-3 text-slate-300">{t.priority || t.severity}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 text-xs rounded-full bg-slate-800 border border-slate-700">
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
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
                      {filteredIncidents.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-slate-500" colSpan={6}>
                            No incidents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xl font-bold text-white mb-4">Audit Logs</h3>
                <div className="space-y-2 max-h-[450px] overflow-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-slate-500 text-sm">No logs</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log._id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold text-sm">{log.action || "ACTION"}</div>
                          <div className="text-xs text-slate-400">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          By: {log.actor?.username || log.updatedBy?.username || "super_admin"} •
                          Target: {log.targetUser?.username || String(log.targetUserId || "").slice(-6)}
                        </div>
                        {log.details ? (
                          <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}