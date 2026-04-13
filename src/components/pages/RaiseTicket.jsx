  import React, { useState, useRef, useEffect } from "react";
  import axios from "axios";
  import { motion, AnimatePresence } from "framer-motion";
  import { z } from "zod";

  /* ---------------- VALIDATION ---------------- */
  const ticketSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  });

  /* ---------------- UTILS ---------------- */
  const generateTicketId = () => `TKT-${Date.now().toString().slice(-6)}`;

  export default function RaiseTicket() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [priority, setPriority] = useState("Low");
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [rootCause, setRootCause] = useState("");

    const [ticketId, setTicketId] = useState(generateTicketId());
    const [createdAt, setCreatedAt] = useState(new Date().toLocaleString());

    const [aiLoading, setAiLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");

    const token = localStorage.getItem("token");

    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    /* ---------------- Speech Recognition ---------------- */
    useEffect(() => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn("Speech Recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);

      recognitionRef.current = recognition;

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }, []);

    const toggleVoiceInput = () => {
      if (!recognitionRef.current) return;

      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        recognitionRef.current.start();
        setListening(true);
      }
    };

    /* ---------------- VALIDATION ---------------- */
    const validate = () => {
      const result = ticketSchema.safeParse({
        title: title.trim(),
        description: description.trim(),
      });

      if (!result.success) {
        const fieldErrors = {};
        result.error.issues.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }

      setErrors({});
      return true;
    };

    /* ---------------- AI PRIORITY PREDICTION ---------------- */
    const predictPriority = async () => {
      if (!token) return priority;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/ai/predict-priority`,
          // `${import.meta.env.VITE_API_URL}/api/ai/predict-priority`,
          {
            title: title.trim(),
            description: description.trim(),
            category,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const predicted = res.data?.priority;
        const allowed = ["Low", "Medium", "High", "Critical"];

        return allowed.includes(predicted) ? predicted : priority;
      } catch (err) {
        console.error(
          "Priority prediction failed:",
          err?.response?.data || err.message
        );
        return priority;
      }
    };

    /* ---------------- LLM DESCRIPTION ---------------- */
    const generateDescriptionFromLLM = async (titleValue) => {
      if (!titleValue.trim() || description.trim()) return;
      if (!token) return;

      try {
        setAiLoading(true);

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/llm/suggest-description`,
          { title: titleValue.trim() },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setDescription(res.data?.description || "");
      } catch (err) {
        console.error(
          "AI suggestion failed:",
          err?.response?.data || err.message
        );
      } finally {
  setSubmitting(false);
}
    };

    /* ---------------- GET SOLUTION SUGGESTIONS ---------------- */
    const getSuggestions = async () => {
      if (!title.trim() || !description.trim()) return;
      if (!token) return;

      try {
        setSuggestionLoading(true);

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/incidents/solution-suggestion`,
          {
            title: title.trim(),
            description: description.trim(),
            department: category || "General",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuggestions(res.data?.suggestions || []);
      } catch (err) {
        console.error(
          "Suggestion fetch failed:",
          err?.response?.data || err.message
        );
        setSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    };

    const getRootCause = async () => {

  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/incidents/root-cause`,
    // `${import.meta.env.VITE_API_URL}/api/incidents/root-cause`,
    {
      title,
      description
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  setRootCause(res.data.rootCause);
};
    /* ---------------- SUBMIT TICKET ---------------- */
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validate()) return;

      if (!token) {
        alert("Please login first!");
        return;
      }

setSubmitting(true);
setStatus("idle");
      try {
        setAiLoading(true);
        const aiPriority = await predictPriority();
        setAiLoading(false);

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("category", category || "General");
        formData.append("priority", aiPriority);

        if (file) {
          formData.append("attachment", file);
        }

const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/incidents`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }
);

        console.log("Ticket created successfully:", res.data);

        setStatus("success");
        setTitle("");
        setDescription("");
        setCategory("General");
        setPriority("Low");
        setFile(null);
        setSuggestions([]);
        setErrors({});
        setTicketId(generateTicketId());
        setCreatedAt(new Date().toLocaleString());

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
            if (file) {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    setStatus("error");
    setErrors({ file: "Only JPG, PNG, and PDF files are allowed" });
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setStatus("error");
    setErrors({ file: "File too large. Max size is 5MB" });
    return;
  }
}
      } catch (err) {
        setAiLoading(false);
        setSubmitting(false);
        console.error(
          "Ticket create error:",
          err?.response?.data || err.message
        );
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }

    };

    /* ---------------- UI ---------------- */
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-xl bg-slate-800 p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Submit a Ticket</h1>

          <div className="text-sm text-slate-400 mb-4">
            <p>
              Ticket ID: <span className="text-white">{ticketId}</span>
            </p>
            <p>Created At: {createdAt}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Subject"
                className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (voice 🎤 or AI ✨)"
                rows={5}
                className="w-full p-3 rounded bg-slate-900 border border-slate-700 pr-20 focus:outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => generateDescriptionFromLLM(title)}
                disabled={aiLoading || !title.trim()}
                title="Generate description using AI"
                className="absolute right-10 top-3 text-lg text-blue-400 hover:text-blue-300 disabled:opacity-40"
              >
                {aiLoading ? "⏳" : "✨"}
              </button>

              <button
                type="button"
                onClick={toggleVoiceInput}
                title="Voice input"
                className={`absolute right-3 top-3 text-xl ${
                  listening ? "text-red-400 animate-pulse" : "text-green-400"
                }`}
              >
                🎤
              </button>
            </div>

            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}

            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="IT">IT</option>
                <option value="Network">Network</option>
                <option value="Hardware">Hardware</option>
                <option value="Accounts">Accounts</option>
              </select>
            </div>

            <div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <button
              type="button"
              onClick={getSuggestions}
              disabled={suggestionLoading || !title.trim() || !description.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded transition disabled:opacity-50"
            >
              {suggestionLoading ? "Checking Solutions..." : "Get Solution Suggestions"}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-4 rounded-lg bg-slate-900 p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">
                  Suggested Solutions
                </h3>

                <div className="space-y-3">
                  {suggestions.map((item, index) => (
                    <div key={index} className="bg-slate-800 p-3 rounded">
                      <p className="font-semibold text-white">{item.title}</p>
                      <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
                        {item.steps?.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={getRootCause} className="bg-purple-600 p-2 rounded">
Get Root Cause
</button>

{rootCause && (
<div className="bg-slate-900 p-3 mt-2 rounded">
Possible Root Cause:
{rootCause}
</div>
)}
            <div className="w-full">
<input
  ref={fileInputRef}
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  onChange={(e) => setFile(e.target.files?.[0] || null)}
  className="hidden"
/>
{errors.file && (
  <p className="text-sm text-red-400 mt-1">{errors.file}</p>
)}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition"
              >
                <span className="flex items-center gap-2">📎 Attach file</span>
                <span className="truncate max-w-[60%] text-slate-400">
                  {file ? file.name : "No file selected"}
                </span>
              </button>
            </div>

<button
  type="submit"
  disabled={submitting}
  className="w-full bg-green-600 hover:bg-green-500 p-3 rounded transition disabled:opacity-50"
>
  {submitting ? "Submitting..." : "Submit Ticket"}
</button>
          </form>

          <AnimatePresence>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-green-400"
              >
                Ticket created successfully!
              </motion.p>
            )}

            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-red-400"
              >
                Failed to create ticket.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { z } from "zod";

// /* ---------------- VALIDATION ---------------- */
// const ticketSchema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   description: z.string().min(10, "Description must be at least 10 characters"),
// });

// /* ---------------- UTILS ---------------- */
// const generateTicketId = () => `TKT-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;

// export default function RaiseTicket() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("General");
//   const [priority, setPriority] = useState("Low");
//   const [file, setFile] = useState(null);

//   const [suggestions, setSuggestions] = useState([]);
//   const [suggestionLoading, setSuggestionLoading] = useState(false);
//   const [rootCause, setRootCause] = useState("");

//   const [ticketId, setTicketId] = useState(generateTicketId());
//   const [createdAt, setCreatedAt] = useState(new Date().toLocaleString());

//   const [aiLoading, setAiLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [status, setStatus] = useState("idle");

//   const token = localStorage.getItem("token");

//   const [listening, setListening] = useState(false);
//   const recognitionRef = useRef(null);
//   const fileInputRef = useRef(null);

//   /* ---------------- Speech Recognition ---------------- */
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) return;

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-IN";
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     recognition.onresult = (event) => {
//       const transcript = event.results?.[0]?.[0]?.transcript || "";
//       if (transcript) {
//         setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
//       }
//     };

//     recognition.onend = () => setListening(false);
//     recognition.onerror = () => setListening(false);
//     recognitionRef.current = recognition;

//     return () => recognitionRef.current?.stop();
//   }, []);

//   const toggleVoiceInput = () => {
//     if (!recognitionRef.current) return;
//     listening ? recognitionRef.current.stop() : recognitionRef.current.start();
//     setListening(!listening);
//   };

//   /* ---------------- VALIDATION ---------------- */
//   const validate = () => {
//     const result = ticketSchema.safeParse({ title: title.trim(), description: description.trim() });
//     if (!result.success) {
//       const fieldErrors = {};
//       result.error.issues.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
//       setErrors(fieldErrors);
//       return false;
//     }
//     if (file) {
//       const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//       if (!allowedTypes.includes(file.type)) {
//         setErrors({ file: "Only JPG, PNG, and PDF allowed" });
//         return false;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors({ file: "Max size is 5MB" });
//         return false;
//       }
//     }
//     setErrors({});
//     return true;
//   };

//   /* ---------------- AI LOGIC ---------------- */
//   const predictPriority = async () => {
//     if (!token) return priority;
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/predict-priority`, 
//         { title, description, category }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       return res.data?.priority || priority;
//     } catch (err) {
//       return priority;
//     }
//   };

//   const generateDescriptionFromLLM = async (titleValue) => {
//     if (!titleValue.trim() || !token) return;
//     try {
//       setAiLoading(true);
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/llm/suggest-description`, 
//         { title: titleValue }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setDescription(res.data?.description || "");
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const getSuggestions = async () => {
//     if (!title.trim() || !token) return;
//     try {
//       setSuggestionLoading(true);
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents/solution-suggestion`, 
//         { title, description, department: category }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSuggestions(res.data?.suggestions || []);
//     } finally {
//       setSuggestionLoading(false);
//     }
//   };

//   const getRootCause = async () => {
//     if (!token) return;
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents/root-cause`, 
//         { title, description }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setRootCause(res.data.rootCause);
//     } catch (e) {}
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     if (!token) return alert("Please login first!");

//     setStatus("loading");
//     try {
//       const aiPriority = await predictPriority();
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("category", category);
//       formData.append("priority", aiPriority);
//       if (file) formData.append("attachment", file);

//       await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setStatus("success");
//       setTitle(""); setDescription(""); setFile(null); setSuggestions([]); setRootCause("");
//       setTicketId(generateTicketId()); setCreatedAt(new Date().toLocaleString());
//       setTimeout(() => setStatus("idle"), 5000);
//     } catch (err) {
//       setStatus("error");
//       setTimeout(() => setStatus("idle"), 5000);
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-4 font-sans relative overflow-hidden">
//       {/* Anime Background Motifs */}
//       <div className="absolute inset-0 pointer-events-none opacity-10">
//         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full blur-[120px]" />
//         <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(#ffffff22 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
//       </div>

//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="w-full max-w-2xl bg-[#161b22] border-2 border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden relative"
//       >
//         {/* Header Decor */}
//         <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
        
//         <div className="p-6 md:p-10">
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter uppercase italic">
//                 Raise <span className="text-purple-400">Ticket</span>
//               </h1>
//               <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">System Protocol v2.0</p>
//             </div>
//             <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-lg font-mono text-[10px] md:text-xs">
//               <div className="flex justify-between gap-4">
//                 <span className="text-slate-500">ID:</span>
//                 <span className="text-cyan-400">{ticketId}</span>
//               </div>
//               <div className="flex justify-between gap-4">
//                 <span className="text-slate-500">STAMP:</span>
//                 <span className="text-pink-400">{createdAt}</span>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-1">
//               <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Subject</label>
//               <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="What's the issue, Commander?"
//                 className="w-full p-4 rounded-xl bg-slate-900/50 border-2 border-slate-800 focus:border-purple-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600"
//               />
//               {errors.title && <p className="text-pink-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.title}</p>}
//             </div>

//             <div className="space-y-1 relative">
//               <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Mission Intel</label>
//               <div className="relative">
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Describe the anomaly..."
//                   rows={4}
//                   className="w-full p-4 rounded-xl bg-slate-900/50 border-2 border-slate-800 focus:border-purple-500/50 focus:outline-none text-white transition-all placeholder:text-slate-600 resize-none"
//                 />
//                 <div className="absolute right-3 bottom-3 flex gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     type="button"
//                     onClick={() => generateDescriptionFromLLM(title)}
//                     disabled={aiLoading || !title.trim()}
//                     className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-colors disabled:opacity-20"
//                   >
//                     {aiLoading ? "..." : "✨ AI"}
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     type="button"
//                     onClick={toggleVoiceInput}
//                     className={`p-2 rounded-lg border transition-colors ${
//                       listening ? "bg-pink-600 text-white border-pink-500 animate-pulse" : "bg-cyan-600/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-600 hover:text-white"
//                     }`}
//                   >
//                     🎤
//                   </motion.button>
//                 </div>
//               </div>
//               {errors.description && <p className="text-pink-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.description}</p>}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Sector</label>
//                 <select
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   className="w-full p-4 rounded-xl bg-slate-900/50 border-2 border-slate-800 focus:border-purple-500/50 focus:outline-none text-white transition-all appearance-none cursor-pointer"
//                 >
//                   <option value="General">General</option>
//                   <option value="IT">IT Department</option>
//                   <option value="Network">Network Ops</option>
//                   <option value="Hardware">Hardware Core</option>
//                   <option value="Accounts">Finances</option>
//                 </select>
//               </div>
//               <div className="space-y-1">
//                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Priority Level</label>
//                 <select
//                   value={priority}
//                   onChange={(e) => setPriority(e.target.value)}
//                   className="w-full p-4 rounded-xl bg-slate-900/50 border-2 border-slate-800 focus:border-purple-500/50 focus:outline-none text-white transition-all appearance-none cursor-pointer"
//                 >
//                   <option value="Low">Low (Routine)</option>
//                   <option value="Medium">Medium (Standard)</option>
//                   <option value="High">High (Urgent)</option>
//                   <option value="Critical">Critical (Immediate)</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="button"
//                 onClick={getSuggestions}
//                 disabled={suggestionLoading || !title.trim()}
//                 className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-cyan-600/10 border border-cyan-500/50 text-cyan-400 font-bold text-xs uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all disabled:opacity-30"
//               >
//                 {suggestionLoading ? "Searching Archives..." : "Analyze Solutions"}
//               </motion.button>
              
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="button"
//                 onClick={getRootCause}
//                 className="py-3 px-6 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-widest hover:border-purple-500 transition-all"
//               >
//                 Root Cause
//               </motion.button>
//             </div>

//             <AnimatePresence mode="wait">
//               {(suggestions.length > 0 || rootCause) && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="space-y-4 pt-4"
//                 >
//                   {rootCause && (
//                     <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
//                       <h4 className="text-purple-400 text-[10px] font-black uppercase mb-1">Detected Root Cause</h4>
//                       <p className="text-slate-300 text-sm leading-relaxed italic">"{rootCause}"</p>
//                     </div>
//                   )}
//                   {suggestions.length > 0 && (
//                     <div className="space-y-3">
//                       <h4 className="text-cyan-400 text-[10px] font-black uppercase ml-1">Suggested Protocols</h4>
//                       {suggestions.map((item, idx) => (
//                         <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
//                           <p className="text-white font-bold text-sm mb-2">{item.title}</p>
//                           <ul className="space-y-1">
//                             {item.steps?.map((step, i) => (
//                               <li key={i} className="text-slate-400 text-xs flex gap-2">
//                                 <span className="text-cyan-500">▶</span> {step}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div className="space-y-3">
//               <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border-2 border-dashed border-slate-700 hover:border-purple-500/50 transition-colors group"
//               >
//                 <span className="text-slate-400 text-xs font-bold uppercase group-hover:text-purple-400">📎 Evidence Attachment</span>
//                 <span className="text-slate-500 text-xs truncate max-w-[150px]">{file ? file.name : "No data selected"}</span>
//               </button>
//               {errors.file && <p className="text-pink-500 text-[10px] font-bold uppercase ml-1">{errors.file}</p>}
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={status === "loading"}
//               className="w-full py-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest text-sm shadow-lg disabled:opacity-50 relative overflow-hidden"
//             >
//               {status === "loading" ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                   </svg>
//                   Transmitting...
//                 </span>
//               ) : "Deploy Ticket"}
//             </motion.button>
//           </form>

//           <AnimatePresence>
//             {status === "success" && (
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-center font-bold text-xs uppercase tracking-widest"
//               >
//                 ✓ Transmission Successful. Mission Log Updated.
//               </motion.div>
//             )}
//             {status === "error" && (
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="mt-6 p-4 rounded-xl bg-pink-500/10 border border-pink-500/50 text-pink-400 text-center font-bold text-xs uppercase tracking-widest"
//               >
//                 ⚠ Transmission Failed. System Error Detected.
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { z } from "zod";

// /* ---------------- VALIDATION ---------------- */
// const ticketSchema = z.object({
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   description: z.string().min(10, "Description must be at least 10 characters"),
// });

// /* ---------------- UTILS ---------------- */
// const generateTicketId = () => `TCK-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;

// export default function RaiseTicket() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("General");
//   const [priority, setPriority] = useState("Low");
//   const [file, setFile] = useState(null);

//   const [suggestions, setSuggestions] = useState([]);
//   const [suggestionLoading, setSuggestionLoading] = useState(false);
//   const [rootCause, setRootCause] = useState("");

//   const [ticketId, setTicketId] = useState(generateTicketId());
//   const [createdAt, setCreatedAt] = useState(new Date().toLocaleString());

//   const [aiLoading, setAiLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [status, setStatus] = useState("idle");

//   const token = localStorage.getItem("token");

//   const [listening, setListening] = useState(false);
//   const recognitionRef = useRef(null);
//   const fileInputRef = useRef(null);

//   /* ---------------- Speech Recognition ---------------- */
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) return;

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-US";
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     recognition.onresult = (event) => {
//       const transcript = event.results?.[0]?.[0]?.transcript || "";
//       if (transcript) {
//         setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
//       }
//     };

//     recognition.onend = () => setListening(false);
//     recognition.onerror = () => setListening(false);
//     recognitionRef.current = recognition;

//     return () => recognitionRef.current?.stop();
//   }, []);

//   const toggleVoiceInput = () => {
//     if (!recognitionRef.current) return;
//     if (listening) {
//       recognitionRef.current.stop();
//     } else {
//       recognitionRef.current.start();
//       setListening(true);
//     }
//   };

//   /* ---------------- VALIDATION ---------------- */
//   const validate = () => {
//     const result = ticketSchema.safeParse({ title: title.trim(), description: description.trim() });
//     if (!result.success) {
//       const fieldErrors = {};
//       result.error.issues.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
//       setErrors(fieldErrors);
//       return false;
//     }
//     if (file) {
//       const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//       if (!allowedTypes.includes(file.type)) {
//         setErrors({ file: "Only JPG, PNG, and PDF allowed" });
//         return false;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setErrors({ file: "Max size is 5MB" });
//         return false;
//       }
//     }
//     setErrors({});
//     return true;
//   };

//   /* ---------------- AI LOGIC ---------------- */
//   const predictPriority = async () => {
//     if (!token) return priority;
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/predict-priority`, 
//         { title, description, category }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       return res.data?.priority || priority;
//     } catch (err) {
//       return priority;
//     }
//   };

//   const generateDescriptionFromLLM = async (titleValue) => {
//     if (!titleValue.trim() || !token) return;
//     try {
//       setAiLoading(true);
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/llm/suggest-description`, 
//         { title: titleValue }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setDescription(res.data?.description || "");
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const getSuggestions = async () => {
//     if (!title.trim() || !token) return;
//     try {
//       setSuggestionLoading(true);
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents/solution-suggestion`, 
//         { title, description, department: category }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSuggestions(res.data?.suggestions || []);
//     } finally {
//       setSuggestionLoading(false);
//     }
//   };

//   const getRootCause = async () => {
//     if (!token) return;
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents/root-cause`, 
//         { title, description }, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setRootCause(res.data.rootCause);
//     } catch (e) {}
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     if (!token) return alert("Please login first!");

//     setStatus("loading");
//     try {
//       const aiPriority = await predictPriority();
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("category", category);
//       formData.append("priority", aiPriority);
//       if (file) formData.append("attachment", file);

//       await axios.post(`${import.meta.env.VITE_API_URL}/api/incidents`, formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setStatus("success");
//       setTitle(""); setDescription(""); setFile(null); setSuggestions([]); setRootCause("");
//       setTicketId(generateTicketId()); setCreatedAt(new Date().toLocaleString());
//       setTimeout(() => setStatus("idle"), 5000);
//     } catch (err) {
//       setStatus("error");
//       setTimeout(() => setStatus("idle"), 5000);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4 md:p-8 font-mono text-[#1a1a1a]" style={{ backgroundImage: 'radial-gradient(#ec4899 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
//       <div className="w-full max-w-3xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
//         <div className="p-6 md:p-10">
//           {/* Header */}
//           <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-4 border-black pb-8">
//             <div>
//               <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter italic">
//                 Support <span className="text-[#ec4899]">Request</span>
//               </h1>
//               <p className="text-black font-bold text-sm mt-2 flex items-center gap-2">
//                 <span className="w-3 h-3 bg-[#3b82f6] border border-black inline-block"></span>
//                 MISSION STATUS: ACTIVE_TICKET_PORTAL
//               </p>
//             </div>
//             <div className="bg-[#f3f4f6] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] md:text-xs">
//               <div className="flex justify-between gap-8 mb-1">
//                 <span className="text-gray-500 font-bold uppercase">Ticket ID</span>
//                 <span className="text-black font-black">{ticketId}</span>
//               </div>
//               <div className="flex justify-between gap-8">
//                 <span className="text-gray-500 font-bold uppercase">Timestamp</span>
//                 <span className="text-black font-black">{createdAt}</span>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* Subject Field */}
//             <div className="space-y-2">
//               <label className="text-sm font-black text-black uppercase flex items-center gap-2">
//                 <span className="text-[#ec4899]">/</span> Subject
//               </label>
//               <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="What's the issue, hero?"
//                 className="w-full px-4 py-3 bg-white border-2 border-black focus:bg-[#eff6ff] focus:outline-none placeholder:text-gray-400 font-bold"
//               />
//               {errors.title && <p className="text-[#e11d48] text-xs font-black bg-[#fff1f2] border border-[#e11d48] px-2 py-1 inline-block">{errors.title}</p>}
//             </div>

//             {/* Description Field */}
//             <div className="space-y-2 relative">
//               <label className="text-sm font-black text-black uppercase flex items-center gap-2">
//                 <span className="text-[#ec4899]">/</span> Intelligence Report
//               </label>
//               <div className="relative">
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Describe the situation in detail..."
//                   rows={5}
//                   className="w-full px-4 py-3 bg-white border-2 border-black focus:bg-[#eff6ff] focus:outline-none placeholder:text-gray-400 font-bold resize-none"
//                 />
//                 <div className="absolute right-3 bottom-3 flex flex-wrap justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={() => generateDescriptionFromLLM(title)}
//                     disabled={aiLoading || !title.trim()}
//                     className="flex items-center gap-1.5 px-3 py-1.5 bg-[#818cf8] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 text-xs font-black uppercase"
//                   >
//                     {aiLoading ? "Processing..." : "✨ AI Assist"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={toggleVoiceInput}
//                     className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase ${
//                       listening 
//                         ? "bg-[#ef4444] text-white" 
//                         : "bg-white text-black"
//                     }`}
//                   >
//                     {listening ? "Rec..." : "🎤 Voice"}
//                   </button>
//                 </div>
//               </div>
//               {errors.description && <p className="text-[#e11d48] text-xs font-black bg-[#fff1f2] border border-[#e11d48] px-2 py-1 inline-block">{errors.description}</p>}
//             </div>

//             {/* Category and Priority */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="text-sm font-black text-black uppercase">Sector</label>
//                 <div className="relative">
//                   <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     className="w-full px-4 py-3 bg-white border-2 border-black focus:outline-none appearance-none cursor-pointer font-bold"
//                   >
//                     <option value="General">General Support</option>
//                     <option value="IT">IT & Systems</option>
//                     <option value="Network">Network Infrastructure</option>
//                     <option value="Hardware">Hardware & Equipment</option>
//                     <option value="Accounts">Billing & Accounts</option>
//                   </select>
//                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
//                     ▼
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-black text-black uppercase">Threat Level</label>
//                 <div className="relative">
//                   <select
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                     className="w-full px-4 py-3 bg-white border-2 border-black focus:outline-none appearance-none cursor-pointer font-bold"
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                     <option value="Critical">Critical</option>
//                   </select>
//                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
//                     ▼
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* AI Analysis Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-2">
//               <button
//                 type="button"
//                 onClick={getSuggestions}
//                 disabled={suggestionLoading || !title.trim()}
//                 className="flex-1 py-3 px-4 bg-white border-2 border-black text-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2 uppercase"
//               >
//                 {suggestionLoading ? "Searching DB..." : "Find Solutions"}
//               </button>
              
//               <button
//                 type="button"
//                 onClick={getRootCause}
//                 className="py-3 px-6 bg-[#facc15] border-2 border-black text-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
//               >
//                 Root Analysis
//               </button>
//             </div>

//             {/* Suggestions & Root Cause Display */}
//             {(suggestions.length > 0 || rootCause) && (
//               <div className="space-y-4 border-t-4 border-black pt-6">
//                 {rootCause && (
//                   <div className="p-4 bg-[#fef9c3] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
//                     <h4 className="text-black text-xs font-black uppercase mb-2 underline">Analysis Result: Root Cause</h4>
//                     <p className="text-black text-sm font-bold">{rootCause}</p>
//                   </div>
//                 )}
//                 {suggestions.length > 0 && (
//                   <div className="space-y-3">
//                     <h4 className="text-black text-xs font-black uppercase ml-1 underline">Database Matches:</h4>
//                     {suggestions.map((item, idx) => (
//                       <div key={idx} className="p-4 bg-[#f0f9ff] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
//                         <p className="text-black font-black text-sm mb-2">{item.title}</p>
//                         <ul className="space-y-1.5">
//                           {item.steps?.map((step, i) => (
//                             <li key={i} className="text-black text-xs font-bold flex gap-2">
//                               <span className="text-[#ec4899] font-black">{">"}</span> {step}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* File Upload */}
//             <div className="space-y-2">
//               <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="w-full flex items-center justify-between p-4 bg-[#fafafa] border-2 border-dashed border-black hover:bg-[#f5f5f5]"
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="text-2xl">📁</span>
//                   <div className="text-left">
//                     <p className="text-black text-sm font-black uppercase">Evidence Attachment</p>
//                     <p className="text-gray-500 text-[10px] font-bold">MAX SIZE 5MB (PNG/JPG/PDF)</p>
//                   </div>
//                 </div>
//                 <span className="bg-black text-white text-[10px] font-bold px-2 py-1 max-w-[150px] truncate">
//                   {file ? file.name : "BROWSE_FILES"}
//                 </span>
//               </button>
//               {errors.file && <p className="text-[#e11d48] text-xs font-black bg-[#fff1f2] border border-[#e11d48] px-2 py-1 inline-block">{errors.file}</p>}
//             </div>

//             {/* Submit Button */}
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={status === "loading"}
//                 className="w-full py-5 bg-[#ec4899] text-white font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black uppercase tracking-widest disabled:opacity-50"
//               >
//                 {status === "loading" ? "TRANSMITTING..." : "SUBMIT MISSION"}
//               </button>
//             </div>
//           </form>

//           {/* Status Notifications */}
//           {status === "success" && (
//             <div className="mt-8 p-4 bg-[#4ade80] border-4 border-black text-black font-black text-center text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
//               SUCCESS! TICKET HAS BEEN LOGGED INTO THE SYSTEM.
//             </div>
//           )}
//           {status === "error" && (
//             <div className="mt-8 p-4 bg-[#f87171] border-4 border-black text-white font-black text-center text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
//               ERROR! TRANSMISSION FAILED. RETRY REQUEST.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }