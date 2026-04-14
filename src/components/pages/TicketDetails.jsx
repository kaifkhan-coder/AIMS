import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TicketDetails() {
  const { id } = useParams();   // ✅ FIX HERE
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("token");

  const fetchTicket = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/${id}`, // ✅ FIX HERE
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();   // ✅ prevent undefined call
  }, [id]);

  const addComment = async () => {
    if (!comment.trim()) return;

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/incidents/${id}/comment`,
      { message: comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComment("");
    fetchTicket();
  };

  if (!ticket) {
    return <p className="p-4 text-slate-400"> Loading incident... </p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5 rounded-2xl bg-white p-5 shadow-lg border border-slate-200"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">{ticket.title}</h2>
        <p className="mt-2 text-slate-600">{ticket.description}</p>
        <p className="mt-3 text-sm text-slate-400">
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-slate-700">💬 Comments</h3>

        {ticket.comments?.length === 0 ? (
          <p className="text-sm italic text-slate-500">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {ticket.comments?.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <p className="text-sm text-slate-700">{c.message}</p>
                {c.createdAt && (
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
{ticket?.attachment && (
  <div className="mt-4">
    <p className="text-sm text-slate-400 mb-1">Attachment</p>
    <a
      href={`${import.meta.env.VITE_API_URL}/api/incidents/attachment/${ticket.attachment}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline"
    >
      View File
    </a>
  </div>
)}
      <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-base font-semibold text-blue-700">Add Comment</h3>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows={4}
          className="w-full resize-none rounded-xl border border-blue-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        <div className="flex justify-end">
          <button
            onClick={addComment}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Add Comment
          </button>
          <button onClick={() => navigate(`/resolve/${id}`)}>
  Resolve Ticket
</button>
        </div>
      </div>
    </motion.div>
  );
}