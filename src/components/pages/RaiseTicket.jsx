import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useParams } from "react-router-dom";

/* ---------------- VALIDATION ---------------- */

const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

/* ---------------- UTILS ---------------- */

// Client-side Ticket ID (for display only – backend should generate final)
const generateTicketId = () => {
  return `TKT-${Date.now().toString().slice(-6)}`;
};

/* ---------------- COMPONENT ---------------- */

export default function RaiseTicket() {
  // const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Low");
  const [file, setFile] = useState(null);

  const [ticketId] = useState(generateTicketId());
  const [createdAt] = useState(new Date().toLocaleString());
  const [aiLoading, setAiLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const token = localStorage.getItem("token");
    const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  /* ----- COMMENTS ----- */
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- LOAD COMMENTS ---------------- */

  // useEffect(() => {
  //   if (!id) return;

  //   axios
  //     .get(`http://localhost:5000/api/incidents/${id}`)
  //     .then((res) => setComments(res.data.comments || []))
  //     .catch((err) => console.error(err));
  // }, [id]);

  /* ---------------- SEND COMMENT ---------------- */

    useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + " " + transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
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

  const sendComment = async () => {
    if (!comment.trim()) return;

    await axios.post(
      `http://localhost:5000/api/incidents/${id}/comment`,
      { message: comment }
    );

    setComments((prev) => [
      ...prev,
      { message: comment, role: "user" },
    ]);

    setComment("");
  };

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const result = ticketSchema.safeParse({ title, description });

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  /* ---------------- SUBMIT TICKET ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    // const formData = new FormData();
    // formData.append("title", title);
    // formData.append("description", description);
    // formData.append("category", category);
    // formData.append("priority", priority);
    // formData.append("ticketId", ticketId);
    // formData.append("createdAt", createdAt);
    // formData.append("status", "Pending");

    // if (file) formData.append("attachment", file);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category || "General");
    formData.append("priority", priority);

    if (file) formData.append("attachment", file);
    console.log("TOKEN FROM LOCALSTORAGE:", token);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/incidents",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      console.log("Ticket created successfully", res.data);
      setStatus("success");
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("Low");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

const generateDescriptionFromLLM = async (titleValue) => {
  if (!titleValue || description.trim()) return;

  try {
    setAiLoading(true);

    const res = await axios.post(
      "http://localhost:5000/api/llm/suggest-description",
      { title: titleValue },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDescription(res.data.description);
  } catch (err) {
    console.error("AI suggestion failed", err.response?.data || err.message);
  } finally {
    setAiLoading(false);
  }
};
  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl bg-slate-800 p-8"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Submit a Ticket
        </h1>

        {/* AUTO INFO */}
        <div className="text-sm text-slate-400 mb-4">
          <p>Ticket ID: <span className="text-white">{ticketId}</span></p>
          <p>Created At: {createdAt}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
<input
  value={title}
  onChange={(e) => {
    setTitle(e.target.value);
  }}
  placeholder="Subject"
  className="w-full p-3 rounded bg-slate-900"
/>
          {errors.title && <p className="text-red-400">{errors.title}</p>}

<div className="relative">
  <div className="relative">
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Description (voice 🎤 or AI ✨)"
    className="w-full p-3 rounded bg-slate-900 pr-20"
  />

  {/* AI GENERATE BUTTON */}
  <button
    type="button"
    onClick={() => generateDescriptionFromLLM(title)}
    disabled={aiLoading || !title}
    title="Generate description using AI"
    className="absolute right-10 top-3 text-lg text-blue-400 hover:text-blue-300 disabled:opacity-40"
  >
    {aiLoading ? "⏳" : "✨"}
  </button>

  {/* VOICE BUTTON */}
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

  {aiLoading && (
    <p className="mt-1 text-xs text-blue-400">
      🤖 Generating description…
    </p>
  )}
</div>
</div>
          {errors.description && (
            <p className="text-red-400">{errors.description}</p>
          )}

          {/* CATEGORY */}
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="w-full p-3 rounded bg-slate-900"
          />

          {/* PRIORITY */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-3 rounded bg-slate-900"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          {/* FILE */}
<div className="w-full">
  {/* Hidden input */}
  <input
    ref={fileInputRef}
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    className="hidden"
  />

  {/* Custom button */}
  <button
    type="button"
    onClick={() => fileInputRef.current.click()}
    className="w-full flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition"
  >
    <span className="flex items-center gap-2">
      📎 Attach file
    </span>

    <span className="truncate max-w-[60%] text-slate-400">
      {file ? file.name : "No file selected"}
    </span>
  </button>
</div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-green-600 p-3 rounded"
          >
            {status === "loading" ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <AnimatePresence>
          {status === "success" && (
            <p className="mt-4 text-green-400">
              Ticket created successfully!
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-red-400">
              Failed to create ticket.
            </p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
