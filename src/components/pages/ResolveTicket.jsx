import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Ticket, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  ChevronRight,
  MessageSquareQuote
} from "lucide-react";
import api from "../../services/api";

export default function ResolveTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("loading");
  const [showPopup, setShowPopup] = useState(false);
  const [shayari, setShayari] = useState("");

useEffect(() => {
  api.get(`/incidents/${id}`)
    .then(async (res) => {
      setTicket(res.data);

      if (res.data.status === "Resolved") {

        // ✅ If shayari already exists → use it
        if (res.data.closingShayari) {
          setShayari(res.data.closingShayari);
        } else {
          // ✅ Otherwise generate it
          const shayariRes = await api.get(`/incidents/${id}/shayari`);
          setShayari(shayariRes.data.shayari);
        }

        setShowPopup(true);
        setStatus("success");

      } else {
        setStatus("confirm");
      }
    })
    .catch(() => setStatus("error"));
}, [id]);

const handleResolve = async () => {
  try {
    // ✅ Public route (no login required)
    await api.put(`/incidents/resolve/${id}`);

    // Shayari
    const res = await api.get(`/incidents/${id}/shayari`);

    setShayari(res.data.shayari);
    setShowPopup(true);
    setStatus("success");

  } catch (err) {
    console.error(err);
    setStatus("error");
  }
};

  const cardVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="h-full w-full bg-[matrix(0,1,1,0)]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl text-center"
            >
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium tracking-tight">Fetching ticket details...</p>
            </motion.div>
          )}

          {status === "confirm" && ticket && (
            <motion.div
              key="confirm"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Resolution Request</h2>
                    <p className="text-xs text-slate-400">ID: #{id.substring(0, 8)}</p>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  {ticket.title}
                </h1>
                
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Assigned to <span className="font-semibold text-slate-900 dark:text-slate-200">{ticket.assignedTo?.full_name || "Support Agent"}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl mb-8 border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    Please confirm if the reported issue has been resolved to your satisfaction. Closing this ticket will archive the conversation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleResolve}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Resolution
                  </button>
                  <button
                    onClick={() => setStatus("error")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                    >
                    <XCircle className="w-5 h-5" />
                    Report Issue
                  </button>
                  <button
                    onClick={() => setStatus("pending")}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                  >
                    <XCircle className="w-5 h-5" />
                    Still Pending
                  </button>
                </div>
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
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-10 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ticket Resolved</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">The request has been marked as complete. Thank you for your feedback.</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 1, ease: "easeInOut" }}
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
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center"
            >
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Status Updated</h1>
              <p className="text-slate-600 dark:text-slate-400">We have notified the agent that the issue requires further attention. You'll receive an update shortly.</p>
              <button 
                onClick={() => setStatus("confirm")} 
                className="mt-8 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Ticket
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
              className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-red-100 dark:border-red-900/30 p-10 text-center"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unable to Load</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">We encountered a problem retrieving the ticket data. Please try again or contact support.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-medium"
              >
                Retry Connection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Modal for Shayari/Messages */}
        <AnimatePresence>
          {showPopup && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl"
              >
                <div className="flex justify-center mb-4">
                   <MessageSquareQuote className="w-10 h-10 text-blue-500/50" />
                </div>
                
                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4">
                  A Final Thought
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-base italic leading-relaxed mb-8">
                  "{shayari || "The resolution is complete, and the system is now operating at peak efficiency."}"
                </p>

                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Dismiss
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}