import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { registerUser } from "../../services/authService";

/* ---------------- ZOD VALIDATION ---------------- */
const registerSchema = z.object({
  full_name: z
    .string()
    .nonempty("Full name is required")
    .min(2, "Full name must be at least 2 characters"),

  username: z
    .string()
    .nonempty("Username is required")
    .min(3, "Username must be at least 3 characters"),

  email: z
    .string()
    .nonempty("Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters"),

  role: z.string().default("user"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  })
});
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-pink-500", shadow: "shadow-[0_0_10px_#ec4899]", width: "25%" };
  if (score === 3) return { label: "Moderate", color: "bg-orange-500", shadow: "shadow-[0_0_10px_#f97316]", width: "50%" };
  if (score === 4) return { label: "Strong", color: "bg-cyan-400", shadow: "shadow-[0_0_10px_#22d3ee]", width: "75%" };
  return { label: "Very Strong", color: "bg-green-400", shadow: "shadow-[0_0_10px_#4ade80]", width: "100%" };
};

/* ---------------- ANIME PARTICLES BACKGROUND ---------------- */
const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleCount = 20;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100 + 20}%`,
      size: Math.random() * 15 + 5,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      isPink: i % 2 === 0,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          initial={{ left: p.left, top: p.top, opacity: 0, scale: 0 }}
          animate={{
            top: "-10%",
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
            rotate: 360,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: p.size,
            height: p.size,
            background: p.isPink ? "rgba(236, 72, 153, 0.6)" : "rgba(34, 211, 238, 0.6)",
            boxShadow: p.isPink ? "0 0 15px rgba(236,72,153,0.8)" : "0 0 15px rgba(34,211,238,0.8)",
          }}
        />
      ))}
    </div>
  );
};

/* ---------------- INPUT FIELD (ENHANCED) ---------------- */
const InputField = ({
  name,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  error,
  onChange,
}) => (
  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="space-y-1">
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-cyan-400 transition-colors">
        <Icon size={18} />
      </div>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-11 pr-4 py-3.5 bg-slate-900/50 text-white placeholder-slate-400 border ${
          error
            ? "border-pink-500 focus:ring-pink-500/50"
            : "border-slate-700/50 focus:border-cyan-400 focus:ring-cyan-400/30"
        } rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-md`}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-pink-500"
          >
            <AlertCircle size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-pink-400 ml-2 mt-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ---------------- MAIN COMPONENT ---------------- */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setApiError("");

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await registerUser(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      if (!success) setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0514] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#0a0514] to-black overflow-hidden p-4 sm:p-8">
      
      {/* Anime Background Elements */}
      <FloatingParticles />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] p-6 sm:p-10 w-full max-w-md overflow-hidden"
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0514]/80 flex flex-col items-center justify-center z-50 rounded-[2rem]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.3)]"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-green-400 font-bold text-lg tracking-wide"
              >
                Account Created!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            <Sparkles className="text-white w-6 h-6" />
          </motion.div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 uppercase tracking-widest">
            Join Guild
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Begin your journey with us today.
          </p>
        </div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <InputField
            name="full_name"
            placeholder="Full Name"
            icon={User}
            value={form.full_name}
            error={errors.full_name}
            onChange={handleChange}
          />

          <InputField
            name="username"
            placeholder="Username"
            icon={User}
            value={form.username}
            error={errors.username}
            onChange={handleChange}
          />

          <InputField
            name="email"
            type="email"
            placeholder="Email Address"
            icon={Mail}
            value={form.email}
            error={errors.email}
            onChange={handleChange}
          />

          <InputField
            name="password"
            type="password"
            placeholder="Password"
            icon={Lock}
            value={form.password}
            error={errors.password}
            onChange={handleChange}
          />

          <AnimatePresence>
            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                    className={`h-full ${strength.color} ${strength.shadow}`}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs mt-2 text-slate-400 flex justify-between">
                  <span>Power level:</span>
                  <span className={`font-bold ${strength.color.replace("bg-", "text-")}`}>
                    {strength.label}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-pink-500 text-sm text-center bg-pink-500/10 py-2 rounded-lg border border-pink-500/20"
              >
                {apiError}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.div
  variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
  className="flex items-start gap-2 mt-2"
>
  <input
    type="checkbox"
    name="terms"
    checked={form.terms}
    onChange={handleChange}
    className="mt-1 accent-cyan-400 w-4 h-4"
  />

  <p className="text-sm text-slate-400">
    I agree to{" "}
    <span 
    onClick={() => navigate("/terms")}
    className="text-cyan-400 cursor-pointer hover:underline">
      Terms & Conditions
    </span>
  </p>
</motion.div>

{errors.terms && (
  <p className="text-xs text-pink-400 ml-1">
    {errors.terms}
  </p>
)}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="pt-2">
            <motion.button
            disabled={loading || !form.terms}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold uppercase tracking-wider flex justify-center items-center gap-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              {loading ? (
                <Loader2 className="animate-spin relative z-10" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Initialize Link <ChevronRight size={18} />
                </span>
              )}
            </motion.button>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            className="text-center mt-6"
          >
            <motion.span
              whileHover={{ scale: 1.05, color: "#22d3ee" }}
              whileTap={{ scale: 0.95 }}
              className="inline-block text-sm text-slate-400 cursor-pointer transition-colors"
              onClick={() => navigate("/login")}
            >
              Already a member?{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:underline decoration-cyan-400 underline-offset-4">
                Login Here
              </span>
            </motion.span>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate, Link } from "react-router-dom";
// import { 
//   User, 
//   Mail, 
//   Lock, 
//   Building, 
//   Loader2, 
//   ArrowRight, 
//   AlertCircle, 
//   Briefcase 
// } from "lucide-react";
// import { registerUser } from "../../services/authService";

// // --- Validation Schema ---
// const registerSchema = z.object({
//   full_name: z.string().min(2, "Full name is required"),
//   username: z.string().min(3, "Username must be at least 3 characters"),
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   department: z.string().optional(),
//   role: z.string().default("user"),
// });

// type RegisterFormData = z.infer<typeof registerSchema>;

// // --- Animation Variants ---
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: { 
//     y: 0, 
//     opacity: 1,
//     transition: { type: "spring", stiffness: 120 } 
//   },
// };

// export default function Register() {
//   const navigate = useNavigate();
//   const [serverError, setServerError] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       full_name: "",
//       username: "",
//       email: "",
//       password: "",
//       department: "",
//       role: "user",
//     },
//   });

//   const onSubmit = async (data) => {
//     setIsLoading(true);
//     setServerError("");

//     try {
//       await registerUser(data);
//       // Preserving original alert logic as requested, though a toast is preferred in modern UI
//       alert("Registered successfully ✅"); 
//       navigate("/login");
//     } catch (err: any) {
//       console.error(err.response?.data || err.message);
//       setServerError(err.response?.data?.message || "Registration failed. Try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 p-4 font-sans text-slate-800">
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={containerVariants}
//         className="w-full max-w-lg"
//       >
//         <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden">
          
//           {/* Header Section */}
//           <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
//             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
//             <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
            
//             <motion.div variants={itemVariants}>
//               <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
//               <p className="text-slate-400 mt-2 text-sm">
//                 Join our platform to get started.
//               </p>
//             </motion.div>
//           </div>

//           {/* Form Section */}
//           <div className="p-8">
//             <AnimatePresence mode="wait">
//               {serverError && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600"
//                 >
//                   <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm font-medium">{serverError}</p>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
//               {/* Full Name */}
//               <motion.div variants={itemVariants} className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
//                   Full Name
//                 </label>
//                 <div className="relative group">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     {...register("full_name")}
//                     type="text"
//                     placeholder="John Doe"
//                     className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'} rounded-xl outline-none focus:ring-4 transition-all duration-200`}
//                   />
//                 </div>
//                 {errors.full_name && (
//                   <p className="text-xs text-red-500 ml-1 mt-1">{errors.full_name.message}</p>
//                 )}
//               </motion.div>

//               {/* Username & Department Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <motion.div variants={itemVariants} className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
//                     Username
//                   </label>
//                   <div className="relative group">
//                     <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                     <input
//                       {...register("username")}
//                       type="text"
//                       placeholder="jdoe"
//                       className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.username ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'} rounded-xl outline-none focus:ring-4 transition-all duration-200`}
//                     />
//                   </div>
//                   {errors.username && (
//                     <p className="text-xs text-red-500 ml-1 mt-1">{errors.username.message}</p>
//                   )}
//                 </motion.div>

//                 <motion.div variants={itemVariants} className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
//                     Department <span className="text-slate-300 normal-case">(Optional)</span>
//                   </label>
//                   <div className="relative group">
//                     <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                     <input
//                       {...register("department")}
//                       type="text"
//                       placeholder="Engineering"
//                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
//                     />
//                   </div>
//                 </motion.div>
//               </div>

//               {/* Email */}
//               <motion.div variants={itemVariants} className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
//                   Email Address
//                 </label>
//                 <div className="relative group">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     {...register("email")}
//                     type="email"
//                     placeholder="john@example.com"
//                     className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'} rounded-xl outline-none focus:ring-4 transition-all duration-200`}
//                   />
//                 </div>
//                 {errors.email && (
//                   <p className="text-xs text-red-500 ml-1 mt-1">{errors.email.message}</p>
//                 )}
//               </motion.div>

//               {/* Password */}
//               <motion.div variants={itemVariants} className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
//                   Password
//                 </label>
//                 <div className="relative group">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     {...register("password")}
//                     type="password"
//                     placeholder="••••••••"
//                     className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-500'} rounded-xl outline-none focus:ring-4 transition-all duration-200`}
//                   />
//                 </div>
//                 {errors.password && (
//                   <p className="text-xs text-red-500 ml-1 mt-1">{errors.password.message}</p>
//                 )}
//               </motion.div>

//               {/* Submit Button */}
//               <motion.div variants={itemVariants} className="pt-4">
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full relative flex items-center justify-center py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isLoading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     <>
//                       <span>Create Account</span>
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </>
//                   )}
//                 </button>
//               </motion.div>

//               <motion.div variants={itemVariants} className="text-center mt-6">
//                 <p className="text-sm text-slate-500">
//                   Already have an account?{" "}
//                   <Link 
//                     to="/login" 
//                     className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
//                   >
//                     Sign in
//                   </Link>
//                 </p>
//               </motion.div>
//             </form>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }