// import React, { useState, useEffect, useMemo } from "react";
// core-js/actual/promise";
// import { useNavigate, Link } from "react-router-dom";
// import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
// import { z } from "zod";
// import { 
//   Loader2, Lock, User, AlertCircle, ArrowRight, Hexagon, 
//   Sparkles, ShieldCheck, Zap, Star, Cpu, Globe, Terminal 
// } from "lucide-react";
// import { loginUser } from "../../services/authService";
// import { connectSocket } from "../pages/Socket.js";

// /* ---------------- VALIDATION ---------------- */
// const loginSchema = z.object({
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
// });

// /* ---------------- ANIME THEME COMPONENTS ---------------- */

// const Scanline = () => (
//   <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03]">
//     <div className="w-full h-[100px] bg-gradient-to-b from-transparent via-white to-transparent animate-scanline" />
//   </div>
// );

// const SakuraPetal = ({ delay, left, duration, size }) => (
//   <motion.div
//     initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
//     animate={{
//       y: "110vh",
//       x: [0, 40, -40, 20, -20],
//       rotate: [0, 180, 360, 540],
//       opacity: [0, 0.7, 0.7, 0.3, 0],
//     }}
//     transition={{
//       duration: duration,
//       delay: delay,
//       repeat: Infinity,
//       ease: "linear",
//     }}
//     className="absolute top-0 rounded-tl-[100%] rounded-br-[100%] shadow-[0_0_8px_rgba(255,182,193,0.4)] pointer-events-none bg-gradient-to-br from-pink-100 to-rose-300 opacity-30 z-0"
//     style={{ left: `${left}%`, width: size, height: size * 1.2 }}
//   />
// );

// const FloatingKanji = ({ char, top, left, delay, color = "text-pink-500/20" }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.5 }}
//     animate={{ 
//       opacity: [0, 0.2, 0],
//       y: [0, -120],
//       scale: [0.5, 1.5, 0.8],
//       rotate: [0, 10, -10, 0]
//     }}
//     transition={{
//       duration: 10,
//       delay,
//       repeat: Infinity,
//       ease: "easeInOut"
//     }}
//     className={`absolute pointer-events-none font-black select-none z-0 text-6xl md:text-8xl ${color}`}
//     style={{ top, left }}
//   >
//     {char}
//   </motion.div>
// );

// const MagicalCircle = ({ delay, className, size = "w-[600px] h-[600px]", color = "border-pink-500/20" }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
//     animate={{
//       opacity: [0.05, 0.15, 0.05],
//       scale: [1, 1.05, 1],
//       rotate: [0, 360],
//     }}
//     transition={{
//       duration: 30,
//       delay,
//       repeat: Infinity,
//       ease: "linear",
//     }}
//     className={`absolute pointer-events-none rounded-full border-[1px] border-dashed flex items-center justify-center ${size} ${className} ${color}`}
//   >
//     <div className="w-[90%] h-[90%] rounded-full border border-cyan-500/10 animate-pulse" />
//     <div className="absolute w-full h-full border-t border-pink-400/20 rounded-full animate-[spin_15s_linear_infinite]" />
//     <div className="absolute w-[70%] h-[70%] border-b border-indigo-400/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
//   </motion.div>
// );

// const CyberBracket = ({ position }) => (
//   <div className={`absolute ${position} w-4 h-4 border-white/20 pointer-events-none
//     ${position.includes('top') ? 'border-t-2' : 'border-b-2'}
//     ${position.includes('left') ? 'border-l-2' : 'border-r-2'}
//   `} />
// );

// /* ---------------- MAIN COMPONENT ---------------- */
// export default function Login() {
//   const navigate = useNavigate();

//   /* State */
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState("");
//   const [validationErrors, setValidationErrors] = useState({});
//   const [lockTimeLeft, setLockTimeLeft] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);

//   /* 3D Tilt Logic */
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);
//   const rotateX = useTransform(y, [-100, 100], [7, -7]);
//   const rotateY = useTransform(x, [-100, 100], [-7, 7]);
//   const springConfig = { damping: 30, stiffness: 200 };
//   const rotateXSpring = useSpring(rotateX, springConfig);
//   const rotateYSpring = useSpring(rotateY, springConfig);

//   const handleMouseMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const centerX = rect.left + rect.width / 2;
//     const centerY = rect.top + rect.height / 2;
//     x.set(e.clientX - centerX);
//     y.set(e.clientY - centerY);
//   };

//   const handleMouseLeave = () => {
//     x.set(0);
//     y.set(0);
//     setIsHovered(false);
//   };

//   /* Handlers */
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     if (serverError) setServerError("");
//     if (validationErrors[e.target.name]) {
//       setValidationErrors(prev => ({ ...prev, [e.target.name]: null }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setServerError("");
//     setValidationErrors({});

//     const result = loginSchema.safeParse(form);

//     if (!result.success) {
//       const errors = {};
//       result.error.issues.forEach((err) => {
//         if (err.path[0]) errors[err.path[0]] = err.message;
//       });
//       setValidationErrors(errors);
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await loginUser(form);
//       if (res.data?.twoFactorRequired) {
//         navigate("/verify-otp-admin", {
//           state: { userId: res.data.userId, email: res.data.email },
//         });
//         return;
//       }

//       if (res.data.token && res.data.user) {
//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("role", res.data.user.role);
//         localStorage.setItem("user", JSON.stringify(res.data.user));
//         connectSocket(res.data.token);
//         const role = res.data.user.role;
//         if (role === "admin") navigate("/admin");
//         else if (role === "staff") navigate("/staff");
//         else if (role === "super_admin") navigate("/super-dashboard");
//         else navigate("/user");
//       }
//     } catch (err) {
//       const data = err?.response?.data;
//       const status = err?.response?.status;
//       if (status === 403 && data?.loginLocked) {
//         setServerError(data.message);
//         if (data?.lockUntil) {
//           const seconds = Math.max(0, Math.ceil((new Date(data.lockUntil) - new Date()) / 1000));
//           setLockTimeLeft(seconds);
//         }
//         return;
//       }
//       if (status === 403 && data?.needsStaffOTP) {
//         navigate("/verify-otp", { state: { email: data.email || form.username } });
//         return;
//       }
//       if (status === 403 && data?.message === "Account deactivated") {
//         setServerError(`Account blocked: ${data.reason || "No reason provided"}`);
//         return;
//       }
//       if (status === 401) {
//         setServerError(data?.message || "Invalid credentials");
//         return;
//       }
//       setServerError(data?.message || "System error. Connection failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (lockTimeLeft <= 0) return;
//     const timer = setInterval(() => {
//       setLockTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [lockTimeLeft]);

//   const petals = useMemo(() => 
//     Array.from({ length: 15 }).map((_, i) => (
//       <SakuraPetal 
//         key={i} 
//         delay={Math.random() * 10} 
//         left={Math.random() * 100} 
//         duration={10 + Math.random() * 15}
//         size={8 + Math.random() * 12}
//       />
//     )), []
//   );

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-[#05050f] overflow-hidden relative perspective-1000 font-sans selection:bg-pink-500/50">
//       <Scanline />
      
//       {/* Background Layers */}
//       <div className="absolute inset-0 overflow-hidden">
//         {/* Animated Grid */}
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#16162d_1px,transparent_1px),linear-gradient(to_bottom,#16162d_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
        
//         {/* Cyber Orbs */}
//         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full animate-pulse" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
//         {/* Decorative Elements */}
//         <MagicalCircle delay={0} className="top-[-20%] left-[-10%]" size="w-[400px] h-[400px] md:w-[600px] md:h-[600px]" />
//         <MagicalCircle delay={5} className="bottom-[-20%] right-[-10%] border-indigo-500/10" size="w-[500px] h-[500px] md:w-[800px] md:h-[800px]" />
        
//         <FloatingKanji char="魂" top="15%" left="5%" delay={0} color="text-pink-500/10" />
//         <FloatingKanji char="光" top="70%" left="85%" delay={3} color="text-cyan-500/10" />
//         <FloatingKanji char="電" top="10%" left="80%" delay={6} color="text-indigo-500/10" />

//         {petals}
//       </div>

//       {/* Main Content */}
//       <motion.div
//         style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformStyle: "preserve-3d" }}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         onMouseEnter={() => setIsHovered(true)}
//         initial={{ scale: 0.95, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
//         className="relative z-10 w-full max-w-[480px] px-6 py-12"
//       >
//         {/* Outer Glow */}
//         <div className={`absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[3rem] blur-2xl transition-opacity duration-700 ${isHovered ? 'opacity-20' : 'opacity-5'}`} />

//         <div className="relative bg-[#0d0d1f]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
//           {/* Cyber Brackets */}
//           <CyberBracket position="top-4 left-4" />
//           <CyberBracket position="top-4 right-4" />
//           <CyberBracket position="bottom-4 left-4" />
//           <CyberBracket position="bottom-4 right-4" />

//           {/* Top Status Bar */}
//           <div className="px-8 pt-6 flex justify-between items-center opacity-40">
//             <div className="flex gap-1.5">
//               <div className="w-2 h-2 rounded-full bg-red-500" />
//               <div className="w-2 h-2 rounded-full bg-yellow-500" />
//               <div className="w-2 h-2 rounded-full bg-green-500" />
//             </div>
//             <div className="text-[10px] font-mono text-pink-400 tracking-tighter flex items-center gap-2">
//               <Globe className="w-3 h-3 animate-spin-slow" />
//               SECURE_NODE_0x7F
//             </div>
//           </div>

//           <div className="p-8 sm:p-12 pt-6">
//             {/* Header */}
//             <div className="text-center mb-10">
//               <motion.div
//                 initial={{ scale: 0, rotate: -45 }}
//                 animate={{ scale: 1, rotate: 0 }}
//                 transition={{ type: "spring", damping: 15, delay: 0.3 }}
//                 className="relative inline-block mb-6"
//               >
//                 <div className="absolute -inset-6 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
//                 <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 shadow-[0_0_40px_rgba(236,72,153,0.3)]">
//                   <ShieldCheck className="w-10 h-10 text-white" />
//                   <div className="absolute inset-0 rounded-2xl border border-white/20" />
//                 </div>
//               </motion.div>
              
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="space-y-2"
//               >
//                 <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
//                   Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">Access</span>
//                 </h2>
//                 <div className="flex items-center justify-center gap-3 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
//                   <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-white/20" />
//                   Identity Verification Required
//                   <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-white/20" />
//                 </div>
//               </motion.div>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <AnimatePresence mode="wait">
//                 {serverError && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3 text-red-400 text-xs font-medium"
//                   >
//                     <AlertCircle className="w-4 h-4 shrink-0" />
//                     <p>{serverError}</p>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Username Field */}
//               <div className="space-y-1.5">
//                 <div className="flex justify-between items-center px-1">
//                   <label className="text-[10px] font-bold text-pink-400/80 uppercase tracking-widest">User ID</label>
//                   <User className="w-3 h-3 text-white/20" />
//                 </div>
//                 <div className="relative group">
//                   <input
//                     name="username"
//                     value={form.username}
//                     onChange={handleChange}
//                     placeholder="USERNAME"
//                     className={`w-full px-5 py-4 rounded-xl bg-white/[0.03] border text-white placeholder-white/10 outline-none transition-all duration-300 font-mono text-sm ${
//                       validationErrors.username
//                         ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20"
//                         : "border-white/10 focus:border-pink-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-pink-500/10"
//                     }`}
//                   />
//                   <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-pink-500 transition-all duration-500 group-focus-within:w-full" />
//                 </div>
//                 {validationErrors.username && (
//                   <p className="text-red-400 text-[9px] font-bold uppercase mt-1 animate-shake">{validationErrors.username}</p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="space-y-1.5">
//                 <div className="flex justify-between items-center px-1">
//                   <label className="text-[10px] font-bold text-pink-400/80 uppercase tracking-widest">Cipher Key</label>
//                   <Lock className="w-3 h-3 text-white/20" />
//                 </div>
//                 <div className="relative group">
//                   <input
//                     type="password"
//                     name="password"
//                     value={form.password}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className={`w-full px-5 py-4 rounded-xl bg-white/[0.03] border text-white placeholder-white/10 outline-none transition-all duration-300 font-mono text-sm ${
//                       validationErrors.password
//                         ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20"
//                         : "border-white/10 focus:border-pink-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-pink-500/10"
//                     }`}
//                   />
//                   <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-500 transition-all duration-500 group-focus-within:w-full" />
//                 </div>
//                 {validationErrors.password && (
//                   <p className="text-red-400 text-[9px] font-bold uppercase mt-1 animate-shake">{validationErrors.password}</p>
//                 )}
//               </div>

//               <div className="pt-4">
//                 <motion.button
//                   type="submit"
//                   whileHover={{ scale: loading || lockTimeLeft > 0 ? 1 : 1.01 }}
//                   whileTap={{ scale: loading || lockTimeLeft > 0 ? 1 : 0.98 }}
//                   disabled={loading || lockTimeLeft > 0}
//                   className="w-full relative group overflow-hidden py-4 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
//                   <div className="relative flex items-center justify-center gap-3">
//                     {loading ? (
//                       <Loader2 className="animate-spin w-4 h-4" />
//                     ) : lockTimeLeft > 0 ? (
//                       <span className="flex items-center gap-2">
//                         <Lock className="w-3 h-3" /> LOCKED: {lockTimeLeft}s
//                       </span>
//                     ) : (
//                       <>
//                         <span>Initialize Link</span>
//                         <Zap className="w-4 h-4 group-hover:text-yellow-300 transition-colors" />
//                       </>
//                     )}
//                   </div>
//                 </motion.button>
//               </div>
//             </form>

//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.8 }}
//               className="mt-8 flex flex-col items-center gap-4"
//             >
//               <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
//               <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold">
//                 <Link to="/forgot-password" title="Recover Access" className="hover:text-pink-400 transition-colors uppercase tracking-wider">
//                   Reset Key
//                 </Link>
//                 <div className="w-1 h-1 rounded-full bg-white/20" />
//                 <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider">
//                   New Account
//                 </Link>
//               </div>
//             </motion.div>
//           </div>

//           {/* Bottom Data Ticker */}
//           <div className="bg-white/[0.02] border-t border-white/5 py-2 px-8 flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <Terminal className="w-3 h-3 text-green-500" />
//               <span className="text-[8px] font-mono text-green-500/60 uppercase animate-pulse">System Online</span>
//             </div>
//             <div className="text-[8px] font-mono text-white/20 uppercase">
//               Ver 4.0.2 // Build_99
//             </div>
//           </div>
//         </div>

//         {/* Floating Accents */}
//         <div className="mt-8 flex justify-center gap-8 opacity-20">
//           {[...Array(3)].map((_, i) => (
//             <motion.div
//               key={i}
//               animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
//               transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
//             >
//               <Star className="w-3 h-3 text-white" />
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>

//       <style dangerouslySetInnerHTML={{__html: `
//         @keyframes scanline {
//           0% { transform: translateY(-100%); }
//           100% { transform: translateY(100vh); }
//         }
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-2px); }
//           75% { transform: translateX(2px); }
//         }
//         .animate-scanline {
//           animation: scanline 8s linear infinite;
//         }
//         .animate-shake {
//           animation: shake 0.2s ease-in-out infinite;
//         }
//         .animate-spin-slow {
//           animation: spin 10s linear infinite;
//         }
//         .perspective-1000 {
//           perspective: 1000px;
//         }
//         input::placeholder {
//           letter-spacing: 0.1em;
//           opacity: 0.3;
//         }
//       `}} />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { z } from "zod";
import { Loader2, Lock, User, AlertCircle, ArrowRight, Hexagon, Box } from "lucide-react";
import { loginUser } from "../../services/authService";
import { connectSocket } from "../pages/Socket.js";
import Image from '../../assets/image.png';

/* ---------------- VALIDATION ---------------- */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

/* ---------------- 3D BACKGROUND COMPONENT ---------------- */
const FloatingShape = ({ delay, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, rotateX: 0, rotateY: 0 }}
    animate={{
      opacity: [0.4, 0.8, 0.4],
      y: [-20, 20, -20],
      rotateX: [0, 180, 360],
      rotateY: [0, 180, 360],
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
    className={`absolute blur-xl opacity-30 pointer-events-none ${className}`}
  >
    <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl transform-style-3d" />
  </motion.div>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function Login() {
  const navigate = useNavigate();

  /* State */
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  /* 3D Tilt Logic */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  /* Handlers */
const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
  setServerError("");
  setValidationErrors({});
};

  // localStorage.clear();
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setServerError("");
  setValidationErrors({});

  const result = loginSchema.safeParse(form);

  if (!result.success) {
    const errors = {};

    result.error.issues.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0]] = err.message;
      }
    });

    setValidationErrors(errors);
    setLoading(false);
    return;
  }

  try {
    const res = await loginUser(form);
    console.log("Login response:", res.data);

    if (res.data?.twoFactorRequired) {
      navigate("/verify-otp-admin", {
        state: { userId: res.data.userId, email: res.data.email },
      });
      return;
    }

    if (res.data.token && res.data.user) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      connectSocket(res.data.token);

      const role = res.data.user.role;

      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else if (role === "super_admin") navigate("/super-dashboard");
      else navigate("/user");
    }
  } catch (err) {
    console.log("LOGIN ERROR:", err?.response?.data || err);

    const data = err?.response?.data;
    const status = err?.response?.status;

    if (status === 403 && data?.loginLocked) {
      setServerError(data.message);

      if (data?.lockUntil) {
        const seconds = Math.max(
          0,
          Math.ceil((new Date(data.lockUntil) - new Date()) / 1000)
        );
        setLockTimeLeft(seconds);
      }
      return;
    }

    if (status === 403 && data?.needsStaffOTP) {
      navigate("/verify-otp", {
        state: { email: data.email || form.username },
      });
      return;
    }

    if (status === 403 && data?.message === "Account deactivated") {
      setServerError(`Account blocked: ${data.reason || "No reason provided"}`);
      return;
    }

    if (status === 401) {
      setServerError(data?.message || "Invalid username or password");
      return;
    }

    setServerError(data?.message || "Server error. Try again later.");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (lockTimeLeft <= 0) return;

  const timer = setInterval(() => {
    setLockTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [lockTimeLeft]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] overflow-hidden relative perspective-1000">

      {/* 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]" />
        <FloatingShape delay={0} className="w-64 h-64 top-20 left-20 bg-blue-600/20" />
        <FloatingShape delay={2} className="w-96 h-96 bottom-10 right-10 bg-purple-600/20" />
        <FloatingShape delay={4} className="w-48 h-48 top-1/2 left-1/2 bg-indigo-600/20" />
      </div>

      {/* 3D Tilt Container */}
      <motion.div
        style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-6"
      >
        {/* Glass Card */}
        <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/20"
              >
                <Hexagon className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400 mt-2 text-sm">Enter your credentials to access the portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
<div>
  <input
    name="username"
    value={form.username}
    onChange={handleChange}
    placeholder="Username"
    className={`w-full p-3 rounded-xl bg-slate-950/50 border text-white outline-none transition ${
      validationErrors.username
        ? "border-red-500 focus:border-red-500"
        : "border-white/10 focus:border-blue-500"
    }`}
  />
  {validationErrors.username && (
    <p className="text-red-400 text-sm mt-1">{validationErrors.username}</p>
  )}
</div>
              {/* Password */}
<div>
  <input
    type="password"
    name="password"
    value={form.password}
    onChange={handleChange}
    placeholder="••••••••"
    className={`w-full p-3 rounded-xl bg-slate-950/50 border text-white outline-none transition ${
      validationErrors.password
        ? "border-red-500 focus:border-red-500"
        : "border-white/10 focus:border-blue-500"
    }`}
  />
  {validationErrors.password && (
    <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
  )}
</div>

<motion.button
type="submit"
  whileHover={{ scale: loading || lockTimeLeft > 0 ? 1 : 1.02 }}
  whileTap={{ scale: loading || lockTimeLeft > 0 ? 1 : 0.98 }}
  disabled={loading || lockTimeLeft > 0}
  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (
    <Loader2 className="animate-spin mx-auto" />
  ) : lockTimeLeft > 0 ? (
    `Try again in ${lockTimeLeft}s`
  ) : (
    "Sign In"
  )}
</motion.button>
              {/* <p className="text-center text-slate-400 mt-6">Or login with</p> */}

              {/* <div className="flex flex-col gap-3 mt-4">
                <a
                  href={`${import.meta.env.VITE_API_URL}/auth/google`}
                  className="flex items-center justify-center gap-3 py-3 rounded-xl
               bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <img
                    src="https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0.jpg"
                    alt="Google"
                    className="w-5 h-5 rounded-full"
                  />
                  Continue with Google
                </a>

                <a
href={`${import.meta.env.VITE_API_URL}/auth/github`}
                  className="flex items-center justify-center gap-3 py-3 rounded-xl
               bg-white/10 hover:bg-white/20 text-white transition bg-amber-100/20"
                >
                  <img
                    src="data:image/png;base64,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"
                    alt="GitHub"
                    className="w-6 h-6"
                  />
                  Continue with GitHub
                </a>
              </div> */}
            </form>

            <p className="text-center text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}