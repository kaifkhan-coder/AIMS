import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ResolveTicket() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/incidents/resolve/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError("Ticket not found or already resolved"));
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-md w-full">
        {error ? (
          <p className="text-rose-400 text-xl">❌ {error}</p>
        ) : data ? (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h1 className="text-2xl font-bold text-white mb-2">Ticket Resolved!</h1>
            <p className="text-slate-400">{data.incident.title}</p>
            <p className="text-emerald-400 mt-2">
              Fixed by: {data.incident.assignedTo?.full_name || "Staff"}
            </p>
          </>
        ) : (
          <p className="text-white">Resolving...</p>
        )}
      </div>
    </div>
  );
}