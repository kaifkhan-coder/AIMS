import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Sparkles, User, Mail, MessageSquare, CheckCircle2, Globe, Phone, MapPin } from "lucide-react";

const mockApi = {
  post: async (url, data) => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await mockApi.post("/contact", form);
      setIsSuccess(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-12 py-16 sm:py-24 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Professional Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-start relative z-10"
      >

        {/* LEFT SIDE: INFO */}
        <div className="space-y-10">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3 h-3" />
              Contact Our Team
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
              Let's build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">exceptional</span> together.
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed">
              Whether you have a specific project in mind or just want to explore possibilities, our team is ready to assist you with world-class support and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[ 
              { icon: <Mail className="w-5 h-5" />, title: "Email Us", detail: "khakaifcom551@gmail.com" },
              { icon: <Phone className="w-5 h-5" />, title: "Call Us", detail: "+91 9326865425" },
              { icon: <MapPin className="w-5 h-5" />, title: "Visit Us", detail: "Kurla, Mumbai" },
              { icon: <Globe className="w-5 h-5" />, title: "Global", detail: "In M.H Saboo Siddik College of Engineering" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-3 text-indigo-400 font-medium">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <span className="text-slate-300">{item.detail}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 blur-3xl opacity-30 -z-10" />
          
          <form
            onSubmit={handleSubmit}
            className="relative w-full space-y-6 bg-slate-900/50 backdrop-blur-xl p-8 sm:p-12 border border-slate-800 rounded-3xl shadow-2xl"
          >
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 z-30 flex flex-col items-center justify-center text-center p-8 rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
                  <p className="text-slate-400">A representative will get back to you within 24 business hours.</p>
                  <button 
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 px-6 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 placeholder:text-slate-600"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 placeholder:text-slate-600"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                Your Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                <textarea
                  placeholder="Tell us about your project..."
                  required
                  rows={5}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 placeholder:text-slate-600 resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send Message
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Floating Support Button */}
      <motion.a
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        href="#"
        className="fixed bottom-8 right-8 bg-white text-slate-950 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 group border border-slate-200"
      >
        <div className="relative">
           <MessageCircle className="w-6 h-6" />
           <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
        </div>
        <span className="font-bold text-sm tracking-tight">Live Support</span>
      </motion.a>
    </div>
  );
}
