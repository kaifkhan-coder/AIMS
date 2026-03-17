import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, RefreshCw, Mail, Clock, ArrowRight } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = new URLSearchParams(location.search).get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // 🔁 FETCH OTP EXPIRY FROM SERVER
  useEffect(() => {
    if (!email) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${process.env.BACKEND_URL}/api/auth/otp-status/${email}`
        );

        if (res.data.status !== "active") {
          setTimeLeft(0);
          return;
        }

        const remaining = Math.floor(
          (res.data.expiresAt - Date.now()) / 1000
        );

        setTimeLeft(remaining > 0 ? remaining : 0);
      } catch (err) {
        console.error("OTP status error", err);
        setTimeLeft(0);
      }
    };

    fetchStatus();
  }, [email]);

  // ⏳ RESEND COOLDOWN TIMER
  useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = setInterval(() => {
      setResendCooldown((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ⏱ MAIN COUNTDOWN
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔐 VERIFY OTP + AUTO LOGIN
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "${process.env.BACKEND_URL}/api/auth/verify-otp",
        { email, otp: otp.toString().trim() }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("✅ Verified & logged in");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const resendOtp = async () => {
    try {
      await axios.post(
        "${process.env.BACKEND_URL}/api/auth/resend-otp",
        { email }
      );
      alert("OTP resent");
      setResendCooldown(30); // ⏳ start cooldown
    } catch (err) {
      alert(err.response?.data?.message || "Resend failed");
    }
  };

  // 🎨 CANVAS BACKGROUND
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    let y = 0;
    let animationFrameId;

    const animate = () => {
      ctx.fillStyle = "#f8fafc"; // Slate-50 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Modernized circle style
      const gradient = ctx.createLinearGradient(
        canvas.width / 2 - 80, y - 80,
        canvas.width / 2 + 80, y + 80
      );
      gradient.addColorStop(0, "#3b82f6"); // Blue-500
      gradient.addColorStop(1, "#60a5fa"); // Blue-400

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, y, 80, 0, Math.PI * 2);
      ctx.fill();

      // Soft shadow for depth
      ctx.shadowColor = "rgba(59, 130, 246, 0.2)";
      ctx.shadowBlur = 30;

      y = (y + 1.5) % (canvas.height + 160);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans text-slate-800">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 block" />

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-4 sm:p-6"
      >
        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden">

          {/* Decorative Header Gradient */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="p-6 sm:p-8 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-inner ring-1 ring-blue-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Verify Account</h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Enter the code sent to <br />
                <span className="font-medium text-slate-700 flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {email || "your email"}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  One-Time Password
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-800 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none placeholder:text-slate-300 placeholder:tracking-widest"
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    {otp.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timer & Status */}
              <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center gap-1.5 font-medium ${timeLeft < 30 && timeLeft > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft > 0 ? `Expires in ${formattedTime}` : "Code Expired"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !otp}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Resend Logic */}
                <AnimatePresence>
                  {(timeLeft === 0 || resendCooldown > 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={resendOtp}
                        className={`w-full py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${resendCooldown > 0
                          ? "border-slate-100 text-slate-400 bg-slate-50 cursor-not-allowed"
                          : "border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50"
                          }`}
                      >
                        {resendCooldown > 0 ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Resend available in {resendCooldown}s</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Resend OTP Code</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* Footer Decoration */}
          <div className="bg-slate-50/80 p-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Secure verification powered by <span className="font-semibold text-slate-500">AIMSAuth Team</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}