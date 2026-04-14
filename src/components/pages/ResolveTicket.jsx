import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2, Ticket, ShieldCheck, ArrowLeft } from "lucide-react";
import api from "../../services/api";

export default function ResolveTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.get(`/incidents/${id}`)
      .then(res => {
        setTicket(res.data);
        setStatus("confirm");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const handleResolve = async () => {
    try {
      await api.post(`/incidents/resolve/${id}`);
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans selection:bg-pink-500 selection:text-white">
      {/* Anime-style Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        {/* Decorative Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl"
            >
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
              <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs">Syncing with Server...</p>
            </motion.div>
          )}

          {status === "confirm" && ticket && (
            <motion.div
              key="confirm"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative group"
            >
              {/* Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500" />
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <Ticket className="w-10 h-10 text-indigo-400" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-white mb-1 tracking-tight text-center">
                {ticket.title}
              </h1>
              <p className="text-zinc-500 text-xs text-center font-bold uppercase tracking-widest mb-8">
                Agent: <span className="text-indigo-400">{ticket.assignedTo?.full_name || "Operative-01"}</span>
              </p>

              <div className="bg-black/40 p-4 rounded-2xl mb-8 border border-white/5">
                <p className="text-zinc-300 text-center leading-relaxed font-medium">
                  Has the issue been fully resolved to your satisfaction?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleResolve}
                  className="group relative flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-black rounded-2xl hover:bg-indigo-400 hover:text-white transition-all duration-300 transform active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  MISSION COMPLETE
                </button>

                <button
                  onClick={() => setStatus("pending")}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800/50 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 hover:text-rose-400 transition-all duration-300"
                >
                  <XCircle className="w-5 h-5" />
                  STILL PENDING
                </button>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-emerald-500/30 text-center shadow-[0_0_40px_rgba(16,185,129,0.1)]"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tighter italic">TICKET CLOSED</h1>
              <p className="text-zinc-400 mb-6">Deployment successful. Thank you for your feedback.</p>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 1.5 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {status === "pending" && (
            <motion.div
              key="pending"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-amber-500/30 text-center"
            >
              <Clock className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-pulse" />
              <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic">Standby...</h1>
              <p className="text-zinc-400">Our team is still processing your request. We'll update you as soon as possible.</p>
              <button 
                onClick={() => setStatus("confirm")} 
                className="mt-8 text-zinc-500 hover:text-white flex items-center gap-2 mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Status
              </button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-rose-500/30 text-center"
            >
              <div className="text-6xl mb-6">⚠️</div>
              <h1 className="text-2xl font-black text-rose-400 mb-2 uppercase">System Error</h1>
              <p className="text-zinc-400">Ticket data could not be retrieved from the mainframe.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
