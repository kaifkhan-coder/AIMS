import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Ticket, Loader2, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "../../services/api";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 I'm your AI Support Agent. How can I help you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowTicket(false);

    try {
      const res = await api.post("/chatbot/chat", {
        message: userMsg.text
      });

      if (res.data.type === "solution") {
        const newMsgs = [];
        res.data.solutions.forEach(sol => {
          newMsgs.push({ sender: "bot", text: sol.title, timestamp: new Date() });
          sol.steps.forEach(step => {
            newMsgs.push({ sender: "bot", text: "👉 " + step, timestamp: new Date() });
          });
        });
        setMessages(prev => [...prev, ...newMsgs]);
      }

      if (res.data.type === "ai") {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: res.data.answer, timestamp: new Date() }
        ]);
        if (res.data.askTicket) setShowTicket(true);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "❌ I'm having trouble connecting to the server. Please try again later.", timestamp: new Date() }
      ]);
    }

    setLoading(false);
  };

  const createTicket = async () => {
    try {
      const lastUserMessage = [...messages]
        .reverse()
        .find(m => m.sender === "user")?.text;

      const res = await api.post("/chatbot/create-ticket", {
        message: lastUserMessage || "User requested ticket support",
        userId: localStorage.getItem("userId")
      });

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `🎫 Ticket Created Successfully! Reference: ${res.data.ticketId}`, timestamp: new Date() }
      ]);
      setShowTicket(false);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Failed to create ticket. Please contact support directly.", timestamp: new Date() }
      ]);
    }
  };

  const clearChat = () => {
    setMessages([{ sender: "bot", text: "Chat cleared. How else can I help?", timestamp: new Date() }]);
    setShowTicket(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "mb-4 flex flex-col overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl transition-all duration-300",
              "fixed inset-0 sm:relative sm:inset-auto",
              "sm:w-[400px] sm:h-[600px] sm:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-900/50 px-4 py-3 border-b border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#05d9e8]/20 flex items-center justify-center border border-[#05d9e8]/30">
                    <Bot size={18} className="text-[#05d9e8]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex items-end gap-2 max-w-[85%]",
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    msg.sender === "user" ? "bg-[#ff2a6d]/20" : "bg-[#05d9e8]/20"
                  )}>
                    {msg.sender === "user" ? <User size={12} className="text-[#ff2a6d]" /> : <Bot size={12} className="text-[#05d9e8]" />}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                      msg.sender === "user"
                        ? "bg-[#ff2a6d] text-white rounded-br-none"
                        : "bg-zinc-800 text-zinc-100 rounded-bl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 size={14} className="animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Actions/Input */}
            <div className="p-4 bg-zinc-900/30 border-t border-white/5">
              {showTicket && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={createTicket}
                  className="w-full mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium py-2 rounded-lg hover:brightness-110 transition-all shadow-lg"
                >
                  <Ticket size={16} />
                  Raise Support Ticket
                </motion.button>
              )}
              <form 
                onSubmit={sendMessage}
                className="flex items-center gap-2 bg-zinc-800/50 border border-white/10 rounded-xl px-3 py-2 focus-within:border-[#05d9e8]/50 transition-colors"
              >
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="text-[#05d9e8] disabled:text-zinc-600 hover:scale-110 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500",
          open 
            ? "bg-zinc-800 text-white rotate-90" 
            : "bg-gradient-to-tr from-[#05d9e8] to-[#ff2a6d] text-white"
        )}
      >
        {open ? <X size={24} /> : <MessageCircle size={28} />}
        {!open && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-sm"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
