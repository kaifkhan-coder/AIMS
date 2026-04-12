// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { User, Moon, Sun } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";
// import ProfileSkeleton from "../../components/pages/ProfileSkeleton.jsx";
// import { useTheme } from "../pages/ThemeContext.jsx";

// export default function UserProfile() {
//   const { user, setUser, loading } = useAuth(); // ✅ single call
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const [oldPass, setOldPass] = useState("");
//   const [newPass, setNewPass] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [showChangePassword, setShowChangePassword] = useState(false);

//   const [stats, setStats] = useState(null);
// const handlePhotoUpload = async (e) => {
//   if (!e.target.files[0]) return;

//   const form    = new FormData();
//   form.append("photo", e.target.files[0]);

//   try {
//     setUploading(true);

//     // const token = localStorage.getItem("token"); // ensure token exists

//     if (!token) {
//       toast.error("Login expired. Please login again.");
//       return;
//     }

//     const res = await axios.post(
//       `${import.meta.env.VITE_API_URL}/api/users/upload-photo`,
//       form,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     setUser(res.data);
//     localStorage.setItem("user", JSON.stringify(res.data));

//     toast.success("Profile photo updated");
//   } catch (err) {
//     console.error(err);
//     toast.error(err.response?.data?.message || "Upload failed");
//   } finally {
//     setUploading(false);
//   }
// };
// useEffect(() => {
//   const fetchStats = async () => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/users/ticket-stats`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setStats(res.data);
//     } catch (err) {
//       console.error("Stats error:", err);
//     }
//   };

//   fetchStats();
// }, []);


//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-900 flex items-center justify-center">
//         <ProfileSkeleton />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-900 text-white flex justify-center px-4 py-10">
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-3xl bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 relative"
//       >
//         {/* Top bar */}
//         <div className="flex justify-between items-center mb-6">

//           <div className="flex items-center gap-3">
//             <div className="relative flex items-center gap-2 bg-slate-700 px-3 py-1 rounded">
//               <User size={16} />
//               <span className="text-sm">{user?.full_name}</span>

//               {user?.unreadCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-full">
//                   {user.unreadCount}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Last login */}
//         <p className="text-sm text-slate-400 mb-6">
//           Last Login:{" "}
//           {user?.lastLogin
//             ? new Date(user.lastLogin).toLocaleString()
//             : "First login"}
//         </p>

//         {/* Profile photo */}
//         <div className="flex flex-col items-center">
//           <motion.img
//             whileHover={{ scale: 1.05 }}
//             src={
//               user?.profilePhoto
//                 ? `${import.meta.env.VITE_API_URL}${user.profilePhoto}?t=${Date.now()}`
//                 : "/"
//             }
//             className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500"
//             alt="profile"
//           />

//           <input id="photoUpload" type="file" hidden onChange={handlePhotoUpload} />

//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             disabled={uploading}
//             onClick={() => document.getElementById("photoUpload").click()}
//             className="mt-4 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded"
//           >
//             {uploading ? "Uploading..." : "Upload Photo"}
//           </motion.button>
//         </div>

//         {/* Info */}
//         <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//           <Info label="Name" value={user?.full_name} />
//           <Info label="Email" value={user?.email} />
//           <Info label="Role" value={user?.role} />
// {stats && (
//   <div className="sm:col-span-2 bg-slate-900 p-4 rounded mt-4">
//     <p className="text-slate-400 text-xs mb-3">Ticket Statistics</p>

//     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
//       <Stat label="Total" value={stats.total} />
//       <Stat label="Open" value={stats.open} />
//       <Stat label="In Progress" value={stats.inProgress} />
//       <Stat label="Resolved" value={stats.resolvedIncidents} />
//       <Stat label="Closed" value={stats.closed} />
//     </div>
//   </div>
// )}
//         </div>

//         {/* Change password */}
//         <motion.button
//           whileTap={{ scale: 0.95 }}
//           onClick={() => setShowChangePassword(!showChangePassword)}
//           className="mt-8 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded"
//         >
//           🔑 Change Password
//         </motion.button>

//         <AnimatePresence>
//           {showChangePassword && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="overflow-hidden mt-4 bg-slate-900 p-4 rounded"
//             >
//               <input
//                 type="password"
//                 placeholder="Old Password"
//                 className="w-full mb-3 p-2 bg-slate-800 rounded"
//                 value={oldPass}
//                 onChange={(e) => setOldPass(e.target.value)}
//               />

//               <input
//                 type="password"
//                 placeholder="New Password"
//                 className="w-full mb-3 p-2 bg-slate-800 rounded"
//                 value={newPass}
//                 onChange={(e) => setNewPass(e.target.value)}
//               />

//               <motion.button
//                 whileTap={{ scale: 0.95 }}
//                 onClick={async () => {
//                   try {
//                     await axios.put(
//                       `${import.meta.env.VITE_API_URL}/api/users/change-password`,
//                       { oldPassword: oldPass, newPassword: newPass },
//                       { headers: { Authorization: `Bearer ${token}` } }
//                     );
//                     toast.success("🔐 Password updated");
//                     setOldPass("");
//                     setNewPass("");
//                     setShowChangePassword(false);
//                   } catch (err) {
//                     toast.error(err.response?.data?.message || "Failed");
//                   }
//                 }}
//                 className="w-full bg-green-600 hover:bg-green-500 py-2 rounded"
//               >
//                 Update Password
//               </motion.button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }

// /* Info box */
// const Info = ({ label, value }) => (
//   <div className="bg-slate-900 p-3 rounded">
//     <p className="text-slate-400 text-xs">{label}</p>
//     <p className="font-medium">{value || "-"}</p>
//   </div>
// );
// const Stat = ({ label, value }) => (
//   <div className="bg-slate-800 p-3 rounded text-center">
//     <p className="text-xs text-slate-400">{label}</p>
//     <p className="text-lg font-bold">{value}</p>
//   </div>
// );

import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Moon, Sun, Shield, Mail, Key, Briefcase, Activity, Camera, Zap, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSkeleton from "../../components/pages/ProfileSkeleton.jsx";

export default function UserProfile() {
  const { user, setUser, loading } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [stats, setStats] = useState(null);

  const handlePhotoUpload = async (e) => {
    if (!e.target.files[0]) return;
    const form = new FormData();
    form.append("photo", e.target.files[0]);

    try {
      setUploading(true);
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/upload-photo`,
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
      toast.success("Avatar synchronization complete!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/ticket-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        console.error("Stats error:", err);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 flex justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Anime Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl bg-[#161b22]/80 backdrop-blur-2xl rounded-3xl p-1 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="bg-[#0d1117] rounded-[calc(1.5rem-1px)] p-6 md:p-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 bg-gradient-to-tr from-fuchsia-500 via-cyan-400 to-purple-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-500"
              />
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={
                    user?.profilePhoto
                      ? `${import.meta.env.VITE_API_URL}${user.profilePhoto}?t=${Date.now()}`
                      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  }
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#0d1117] relative z-10 bg-[#161b22]"
                  alt="profile"
                />
                <label htmlFor="photoUpload" className="absolute bottom-2 right-2 z-20 bg-fuchsia-600 hover:bg-fuchsia-500 p-2.5 rounded-full cursor-pointer shadow-lg transform transition-transform hover:scale-110 active:scale-90 border-2 border-[#0d1117]">
                  <Camera size={20} className="text-white" />
                  <input id="photoUpload" type="file" hidden onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  {user?.full_name}
                </h1>
                <span className="px-3 py-1 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest rounded-full">
                  {user?.role || "Player"}
                </span>
              </div>
              <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm mb-4">
                <Activity size={14} className="text-cyan-400" />
                Last active: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "New User"}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-[#1c2128] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Mail size={16} className="text-fuchsia-400" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <StatCard label="Total Quests" value={stats?.total || 0} icon={<Star size={16}/>} color="from-blue-500 to-cyan-400" />
            <StatCard label="Active" value={stats?.open || 0} icon={<Zap size={16}/>} color="from-amber-400 to-orange-500" />
            <StatCard label="In Progress" value={stats?.inProgress || 0} icon={<Activity size={16}/>} color="from-fuchsia-500 to-purple-600" />
            <StatCard label="Resolved" value={stats?.resolvedIncidents || 0} icon={<Shield size={16}/>} color="from-emerald-400 to-teal-500" />
            <StatCard label="Closed" value={stats?.closed || 0} icon={<Key size={16}/>} color="from-slate-500 to-slate-700" />
          </motion.div>

          {/* Action Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={18} className="text-fuchsia-500" />
                Account Details
              </h3>
              <div className="space-y-3">
                <InfoRow label="Full Designation" value={user?.full_name} icon={<User size={16}/>} />
                <InfoRow label="Access Level" value={user?.role} icon={<Shield size={16}/>} />
                <InfoRow label="Primary Alias" value={user?.email} icon={<Mail size={16}/>} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key size={18} className="text-cyan-500" />
                Security Hub
              </h3>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full group relative flex items-center justify-between p-4 bg-[#1c2128] hover:bg-[#252d38] border border-white/5 rounded-2xl transition-all duration-300"
              >
                <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">Modify Security Key</span>
                <div className={`transform transition-transform duration-300 ${showChangePassword ? 'rotate-180' : ''}`}>
                  <Zap size={18} className="text-cyan-400" />
                </div>
              </button>

              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3 pt-2"
                  >
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full p-4 bg-[#0d1117] border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all placeholder:text-slate-600"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full p-4 bg-[#0d1117] border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        try {
                          await axios.put(
                            `${import.meta.env.VITE_API_URL}/api/users/change-password`,
                            { oldPassword: oldPass, newPassword: newPass },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          toast.success("Security protocols updated!");
                          setOldPass("");
                          setNewPass("");
                          setShowChangePassword(false);
                        } catch (err) {
                          toast.error(err.response?.data?.message || "Protocol update failed");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all"
                    >
                      Initialize Update
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-4 bg-[#1c2128]/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="p-2 bg-[#0d1117] rounded-lg text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      <p className="text-sm font-semibold text-slate-200">{value || "---"}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="relative group p-4 bg-[#1c2128] rounded-2xl border border-white/5 overflow-hidden"
  >
    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color}`} />
    <div className="flex flex-col items-center gap-1">
      <div className="text-slate-500 group-hover:text-white transition-colors mb-1">
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] uppercase font-bold text-slate-500 text-center leading-tight">{label}</p>
    </div>
  </motion.div>
);