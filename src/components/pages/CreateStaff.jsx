// import { useState } from "react";
// import { createStaff } from "../../services/adminService.js";

// export default function CreateStaff() {
//   const [form, setForm] = useState({
//     full_name: "",
//     email: "",
//     username: "",
//     password: "",
//     department: ""
//   });

//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await createStaff(form);
//       setOtpSent(true);

//       setForm({
//         full_name: "",
//         email: "",
//         username: "",
//         password: "",
//         department: "",
//         role: "staff"
//       });
//     } catch (err) {
//       alert(err.response.data.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4
//                     bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">

//       <div className="w-full max-w-2xl bg-white/90 backdrop-blur
//                       rounded-2xl shadow-xl p-8
//                       transform transition-all duration-500
//                       hover:scale-[1.01] animate-fadeIn">

//         <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
//           Create Staff Account
//         </h2>

//         <p className="text-center text-gray-500 mb-6">
//           Staff will receive an OTP for account verification
//         </p>

//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           {[
//             { name: "full_name", placeholder: "Full Name", type: "text" },
//             { name: "email", placeholder: "Email Address", type: "email" },
//             { name: "username", placeholder: "Username", type: "text" },
//             { name: "password", placeholder: "Password", type: "password" },
//             { name: "department", placeholder: "Department", type: "text" },
//           ].map((field, index) => (
//             <input
//               key={index}
//               type={field.type}
//               name={field.name}
//               value={form[field.name]}
//               onChange={handleChange}
//               placeholder={field.placeholder}
//               required
//               className="w-full px-4 py-3 border rounded-xl
//                          focus:outline-none focus:ring-2 focus:ring-indigo-500
//                          transition-all duration-300"
//             />
//           ))}

//           <button
//             type="submit"
//             disabled={loading}
//             className="md:col-span-2 mt-2 py-3
//                        bg-indigo-600 text-white font-semibold rounded-xl
//                        hover:bg-indigo-700 hover:shadow-lg
//                        active:scale-95 transition-all duration-300
//                        disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "Creating Staff..." : "Create Staff"}
//           </button>
//         </form>

//         {/* OTP INFO SECTION */}
//         {otpSent && (
//           <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200
//                           animate-slideUp">
//             <h3 className="text-green-700 font-semibold mb-1">
//               ✅ OTP Sent Successfully
//             </h3>
//             <p className="text-sm text-green-600">
//               An OTP has been sent to the staff email.
//               The staff must verify their account before logging in.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  UserPlus,
  Mail,
  User,
  Lock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { createStaff } from "../../services/adminService.js";

/* ---------------- ZOD SCHEMA ---------------- */
const staffSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(2, "Department is required"),
});

/* ---------------- 3D CARD ---------------- */
const Floating3DCard = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX / rect.width - 0.5);
    y.set(e.clientY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full h-64 md:h-full min-h-[300px] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ translateZ: 60 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center gap-4"
      >
        <div className="p-4 bg-white/20 rounded-full">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-xl">Secure Access</h3>
          <p className="text-indigo-100 text-sm mt-1">
            OTP Verification Enabled
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function CreateStaff({ onSuccess }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      const copy = { ...errors };
      delete copy[name];
      setErrors(copy);
    }
  };

  const validateForm = () => {
    try {
      staffSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setServerError(null);

  if (
    !form.full_name ||
    !form.email ||
    !form.username ||
    !form.password ||
    !form.department
  ) {
    alert("All fields are required");
    return;
  }

  if (!validateForm()) return;

  setLoading(true);

  try {
    const res = await createStaff(form);
    console.log("SUCCESS:", res.data);

    setOtpSent(true);

setForm({
  full_name: "",
  email: "",
  username: "",
  password: "",
  department: "",
});

setTimeout(() => {
  if (onSuccess) onSuccess();
}, 1500);


  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR MESSAGE:", err.response?.data);

    setServerError(
      err.response?.data?.message
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="w-full">
      {serverError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          {serverError}
        </div>
      )}

{otpSent && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm"
  >
    OTP sent successfully to staff email.
  </motion.div>
)}


      <form onSubmit={handleSubmit} className="space-y-4">
        {["full_name", "email", "username", "department", "password"].map(
          (name) => (
            <div key={name}>
              <input
                type={name === "password" ? "password" : "text"}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={name.replace("_", " ").toUpperCase()}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white"
              />
              {errors[name] && (
                <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
              )}
            </div>
          )
        )}
        <button
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white flex justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Create Staff"}
        </button>
      </form>
    </div>
  );
}
