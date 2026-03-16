import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { registerUser } from "../../services/authService";

/* ---------------- ZOD VALIDATION ---------------- */
const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().default("user"),
});
const usernameSchema = z
  .string()
  .min(4, "Username must be at least 4 characters")
  .max(20, "Username must be under 20 characters")
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 
    "Username must start with a letter and contain only letters, numbers, _");

    const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

  const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "25%" };
  if (score === 3) return { label: "Moderate", color: "bg-yellow-500", width: "50%" };
  if (score === 4) return { label: "Strong", color: "bg-blue-500", width: "75%" };
  return { label: "Very Strong", color: "bg-green-500", width: "100%" };
};

/* ---------------- INPUT FIELD (FIXED) ---------------- */
const InputField = ({
  name,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  error,
  onChange,
}) => (
  <div className="space-y-1">
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-indigo-500">
        <Icon size={18} />
      </div>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-slate-200 focus:ring-indigo-200"
        } rounded-xl focus:outline-none focus:ring-4`}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-500"
          >
            <AlertCircle size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {error && (
      <p className="text-xs text-red-500 ml-1">{error}</p>
    )}
  </div>
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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const strength = getPasswordStrength(form.password);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/90 flex items-center justify-center z-50"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Email"
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
          {form.password && (
  <div className="mt-2">
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: strength.width }}
        className={`h-full ${strength.color}`}
        transition={{ duration: 0.4 }}
      />
    </div>
    <p className="text-xs mt-1 text-slate-500">
      Password strength: <span className="font-semibold">{strength.label}</span>
    </p>
  </div>
)}
          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          <button
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            <ChevronRight />
          </button>
          <motion.div
  className="text-center mt-6"
  initial={{ opacity: 0, rotateX: -30, y: 20 }}
  animate={{ opacity: 1, rotateX: 0, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <motion.span
    whileHover={{
      rotateY: 15,
      scale: 1.05,
    }}
    whileTap={{
      rotateY: -15,
      scale: 0.95,
    }}
    transition={{ type: "spring", stiffness: 200 }}
    className="inline-block text-sm text-slate-600 cursor-pointer"
    onClick={() => navigate("/login")}
  >
    Already have an account?{" "}
    <span className="font-semibold text-indigo-600 hover:underline">
      Go to Login
    </span>
  </motion.span>
</motion.div>

        </form>
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