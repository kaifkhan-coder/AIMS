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
        setAiLoading(false);
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

      setStatus("loading");

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

        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setAiLoading(false);
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
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />

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
              disabled={status === "loading"}
              className="w-full bg-green-600 hover:bg-green-500 p-3 rounded transition disabled:opacity-50"
            >
              {status === "loading" ? "Submitting..." : "Submit Ticket"}
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