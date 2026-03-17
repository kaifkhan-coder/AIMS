import React, { useState } from "react";
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

  const result = loginSchema.safeParse(form);
  if (!result.success) {
    const errors = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) errors[err.path[0]] = err.message;
    });
    setValidationErrors(errors);
    setLoading(false);
    return;
  }

  try {
    const res = await loginUser(form);
    console.log("Login response:", res.data);

    // ✅ Admin 2FA only
    if (res.data?.twoFactorRequired) {
      navigate("/verify-otp-admin", {
        state: { userId: res.data.userId, email: res.data.email }
      });
      return;
    }

    // ✅ Normal login
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

    // ✅ Only go to staff OTP page when backend explicitly says so
    if (status === 403 && data?.needsStaffOTP) {
      navigate("/verify-otp", {
        state: { email: data.email || form.username }
      });
      return;
    }

    // ✅ Blocked / deactivated user should stay on login page
    if (status === 403 && data?.message === "Account deactivated") {
      setServerError(`Account blocked: ${data.reason || "No reason provided"}`);
      return;
    }

    if (status === 401) {
      setServerError("Invalid username or password");
    } else {
      setServerError(data?.message || "Server error. Try again later.");
    }
  } finally {
    setLoading(false);
  }
}; 
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
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full p-3 rounded-xl bg-slate-950/50 border border-white/10 text-white"
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl bg-slate-950/50 border border-white/10 text-white"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
              </motion.button>
              <p className="text-center text-slate-400 mt-6">Or login with</p>

              <div className="flex flex-col gap-3 mt-4">
                <a
                  href={`${process.env.BACKEND_URL}/auth/google`}
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
href={`${process.env.BACKEND_URL}/auth/github`}
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
              </div>


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
