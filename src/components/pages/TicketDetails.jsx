import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Paperclip, 
  Calendar, 
  User, 
  Send, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility for tailwind classes */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STATUS_COLORS = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function TicketDetails({ ticketId, onStatusChange }) {
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchTicket = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(res.data);
    } catch (err) {
      console.error("Failed to fetch ticket", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId, token]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const addComment = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/incidents/${ticketId}/comment`,
        { message: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      await fetchTicket();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-100 bg-white p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium animate-pulse">Loading incident details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
        <p className="text-red-700 font-semibold">Incident not found</p>
        <p className="text-red-500 text-sm">The requested ticket could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Main Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Ticket #{ticketId.slice(-6)}</span>
                <span>•</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full border text-[10px]",
                  STATUS_COLORS[ticket.status?.toLowerCase()] || STATUS_COLORS.open
                )}>
                  {ticket.status || "Open"}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{ticket.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(ticket.createdAt), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {ticket.attachment && (
            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Attached Resource</p>
                    <p className="text-xs text-slate-500">Click to view or download</p>
                  </div>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL}/api/incidents/attachment/${ticket.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  View File
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Activity Feed
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {ticket.comments?.length || 0} Comments
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {ticket.comments?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border-2 border-dashed border-slate-100 p-12 text-center"
                >
                  <MessageSquare className="mx-auto h-10 w-10 text-slate-200" />
                  <p className="mt-2 text-sm text-slate-400">No discussion yet. Start the conversation!</p>
                </motion.div>
              ) : (
                ticket.comments.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-hover hover:border-blue-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900">Team Member</p>
                          {c.createdAt && (
                            <span className="text-[10px] font-medium text-slate-400 uppercase">
                              {format(new Date(c.createdAt), "MMM d, HH:mm")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">{c.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Comment Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
            <div className="flex items-center gap-2 text-blue-800">
              <Send className="h-4 w-4" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Post Update</h3>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your message..."
              rows={5}
              className="w-full resize-none rounded-xl border border-blue-200 bg-white p-4 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
            />

            <button
              onClick={addComment}
              disabled={!comment.trim() || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Comment
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
