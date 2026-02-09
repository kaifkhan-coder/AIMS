// import api from "../services/api.js";
import { useState } from "react";

export default function ResolveButton({ ticketId, onResolved }) {
  const [loading, setLoading] = useState(false);

  const resolveTicket = async () => {
    try {
      setLoading(true);
      await api.put(`/incidents/${ticketId}/resolve`);
      alert("Ticket resolved & sent to ML");
      onResolved();
    } catch (err) {
      alert("Failed to resolve ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={resolveTicket}
      disabled={loading}
      className="bg-green-600 px-4 py-2 rounded text-white"
    >
      {loading ? "Resolving..." : "Resolve Ticket"}
    </button>
  );
}