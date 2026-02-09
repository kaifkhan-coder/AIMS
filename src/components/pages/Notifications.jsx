import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [openId, setOpenId] = useState(null); // 🔥 expanded notification
  const token = localStorage.getItem("token");
  const [deleteId, setDeleteId] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleClick = async (n) => {
    // Toggle expand
    setOpenId(openId === n._id ? null : n._id);

    // Mark as read once
    if (!n.read) {
      try {
        await axios.put(
          `http://localhost:5000/api/notifications/${n._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications((prev) =>
          prev.map((x) =>
            x._id === n._id ? { ...x, read: true } : x
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

const handleDelete = async (e, notificationId) => {
  e.stopPropagation(); // stop card click

  if (!window.confirm("Delete this notification?")) return;

  try {
    await axios.delete(
      `http://localhost:5000/api/notifications/${notificationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // remove from UI
    setNotifications((prev) =>
      prev.filter((n) => n._id !== notificationId)
    );

    if (openId === notificationId) {
      setOpenId(null);
    }
  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert("Failed to delete notification");
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
            <span className="rounded-full bg-red-500 px-2 text-xs">
              {unreadCount}
            </span>
          )}
        </div>

        {/* EMPTY STATE */}
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
                className={`cursor-pointer rounded-lg border p-4 shadow-md
                  ${n.read
                    ? "border-slate-700 bg-slate-800"
                    : "border-green-500 bg-slate-800"}
                `}
              >
                {/* TITLE (ALWAYS VISIBLE) */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {n.message}
                  </h3>

                  {!n.read && (
                    <span className="text-green-400 text-xs">●</span>
                  )}
                </div>

                {/* EXPANDED DETAILS */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-sm text-slate-300"
                    >
                      <h3 className="font-semibold text-lg">
                      <p>{n.message.length > 40 ? n.message.substring(0, 40) + "..." : n.message}</p>
                      </h3>

                      {n.createdAt && (
                        <p className="mt-2 text-xs text-slate-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      )}

                      <p className="mt-1 text-xs">
                        Status:{" "}
                        <span
                          className={
                            n.read
                              ? "text-slate-400"
                              : "font-semibold text-green-400"
                          }
                        >
                          {n.read ? "Read" : "Unread"}
                        </span>
                        <button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(e, n._id);
  }}
  className="mask-conic-from-emerald-300 text-red-400 hover:text-red-500"
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