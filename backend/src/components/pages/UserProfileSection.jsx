import {useAuth} from "../context/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";
const UserProfileSection = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || ""
  });

  const token = localStorage.getItem("token");

  const handleUpdate = async () => {
    try {
      await axios.put(
        "${process.env.BACKEND_URL}/api/users/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">
        👤 Profile Settings
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-md space-y-4">
          <div>
            <label className="text-sm text-slate-500">Username</label>
            <input
              disabled={!editing}
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full mt-1 p-3 rounded-xl bg-white/60 border border-slate-200"
            />
          </div>

          <div>
            <label className="text-sm text-slate-500">Email</label>
            <input
              disabled={!editing}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full mt-1 p-3 rounded-xl bg-white/60 border border-slate-200"
            />
          </div>

          {editing ? (
            <button
              onClick={handleUpdate}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Account Info
          </h3>

          <div className="space-y-3 text-slate-600">
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Department:</strong> {user?.department || "N/A"}</p>
            <p><strong>Status:</strong> Active 🟢</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfileSection;