import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5000";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [openId, setOpenId] = useState(null);

  // ✅ token is now reactive
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Listen for token changes in SAME TAB using custom event
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("token"));
    window.addEventListener("auth:changed", syncToken);

    // Optional: other tabs
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener("auth:changed", syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  // ✅ Fetch notifications whenever token changes
  useEffect(() => {
    setNotifications([]);
    setOpenId(null);

    if (!token) return;

    axios
      .get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data || []))
      .catch((err) => console.error(err));
  }, [token]);

  const handleClick = async (n) => {
    setOpenId((prev) => (prev === n._id ? null : n._id));

    if (!n.read) {
      try {
        await axios.put(
          `${API}/api/notifications/${n._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();

    if (!window.confirm("Delete this notification?")) return;

    try {
      await axios.delete(`${API}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (openId === notificationId) setOpenId(null);
    } catch (err) {
      console.error("DELETE ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to delete notification");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-4"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">🔔 Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 text-xs">{unreadCount}</span>
          )}
        </div>

        {notifications.length === 0 && (
          <p className="rounded-lg bg-slate-800 p-4 text-center text-slate-400">
            No notifications yet
          </p>
        )}

        <AnimatePresence>
          {notifications.map((n) => {
            const isOpen = openId === n._id;

            return (
              <motion.div
                key={n._id}
                layout
                onClick={() => handleClick(n)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className={`cursor-pointer rounded-lg border p-4 shadow-md ${
                  n.read ? "border-slate-700 bg-slate-800" : "border-green-500 bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{n.message}</h3>
                  {!n.read && <span className="text-green-400 text-xs">●</span>}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-sm text-slate-300"
                    >
                      {n.createdAt && (
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      )}

                      <p className="mt-1 text-xs flex items-center gap-2">
                        Status:
                        <span className={n.read ? "text-slate-400" : "font-semibold text-green-400"}>
                          {n.read ? "Read" : "Unread"}
                        </span>

                        <button
                          onClick={(e) => handleDelete(e, n._id)}
                          className="ml-auto text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}