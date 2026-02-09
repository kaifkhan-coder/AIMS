import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function TicketDetails({ ticketId, onStatusChange }) {
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("token");

  const fetchTicket = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/incidents/${ticketId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTicket(res.data);
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const addComment = async () => {
    if (!comment.trim()) return;

    await axios.post(
      `http://localhost:5000/api/incidents/${ticketId}/comment`,
      { message: comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComment("");
    fetchTicket();
  };

  if (!ticket)
    return <p className="text-slate-400 p-4">Loading incident...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow p-5 space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold">{ticket.title}</h2>
        <p className="text-slate-600 mt-1">{ticket.description}</p>
        <p className="text-sm text-slate-400 mt-2">
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

      {/* COMMENTS */}
      <div>
        <h3 className="font-semibold mb-2">💬 Comments</h3>

        {ticket.comments?.length === 0 && (
          <p className="text-slate-400 text-sm">No comments yet</p>
        )}

        <div className="space-y-2">
          {ticket.comments?.map((c, i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-lg p-2 text-sm"
            >
              {c.message}
            </div>
          ))}
        </div>
      </div>

      {/* ADD COMMENT */}
      <div className="flex flex-col gap-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment…"
          className="border rounded-lg p-2 resize-none shadow-2xl border-blue-500 bg-blue-50"
        />
        <button
          onClick={addComment}
          className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Comment
        </button>
      </div>
    </motion.div>
  );
}
