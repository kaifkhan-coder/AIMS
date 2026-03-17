import React, { useState } from "react";
import axios from "axios";
import { User, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSkeleton from "../../components/pages/ProfileSkeleton.jsx";
import { useTheme } from "../pages/ThemeContext.jsx";

export default function StaffProfile() {
  const { user, setUser, loading } = useAuth(); // ✅ single call
  const { theme, setTheme } = useTheme();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

const handlePhotoUpload = async (e) => {
  if (!e.target.files[0]) return;

  const form    = new FormData();
  form.append("photo", e.target.files[0]);

  try {
    setUploading(true);

    // const token = localStorage.getItem("token"); // ensure token exists

    if (!token) {
      toast.error("Login expired. Please login again.");
      return;
    }

    const res = await axios.post(
      "${process.env.BACKEND_URL}/api/users/upload-photo",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));

    toast.success("Profile photo updated");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 relative"
      >
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2 bg-slate-700 px-3 py-1 rounded">
              <User size={16} />
              <span className="text-sm">{user?.full_name}</span>

              {user?.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {user.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Last login */}
        <p className="text-sm text-slate-400 mb-6">
          Last Login:{" "}
          {user?.lastLogin
            ? new Date(user.lastLogin).toLocaleString()
            : "First login"}
        </p>

        {/* Profile photo */}
        <div className="flex flex-col items-center">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={
              user?.profilePhoto
                ? `${process.env.BACKEND_URL}${user.profilePhoto}?t=${Date.now()}`
                : "/"
            }
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500"
            alt="profile"
          />

          <input id="photoUpload" type="file" hidden onChange={handlePhotoUpload} />

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={uploading}
            onClick={() => document.getElementById("photoUpload").click()}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded"
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </motion.button>
        </div>

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Info label="Name" value={user?.full_name} />
          <Info label="Email" value={user?.email} />
          <Info label="Role" value={user?.role} />
          <Info label="Department" value={user?.department} />
        </div>

        {/* Change password */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="mt-8 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded"
        >
          🔑 Change Password
        </motion.button>

        <AnimatePresence>
          {showChangePassword && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 bg-slate-900 p-4 rounded"
            >
              <input
                type="password"
                placeholder="Old Password"
                className="w-full mb-3 p-2 bg-slate-800 rounded"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
              />

              <input
                type="password"
                placeholder="New Password"
                className="w-full mb-3 p-2 bg-slate-800 rounded"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    await axios.put(
                      "${process.env.BACKEND_URL}/api/users/change-password",
                      { oldPassword: oldPass, newPassword: newPass },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("🔐 Password updated");
                    setOldPass("");
                    setNewPass("");
                    setShowChangePassword(false);
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Failed");
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-500 py-2 rounded"
              >
                Update Password
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* Info box */
const Info = ({ label, value }) => (
  <div className="bg-slate-900 p-3 rounded">
    <p className="text-slate-400 text-xs">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);