export default function ResolveTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/${id}`)
      .then(res => { setTicket(res.data); setStatus("confirm"); })
      .catch(() => setStatus("error"));
  }, [id]);

  const handleResolve = async () => {
    await axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/resolve/${id}`);
    setStatus("success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-md w-full">
        
        {status === "loading" && <p className="text-white">Loading...</p>}
        
        {status === "confirm" && ticket && (
          <>
            <p className="text-4xl mb-4">🎫</p>
            <h1 className="text-xl font-bold text-white mb-2">{ticket.title}</h1>
            <p className="text-slate-400 text-sm mb-2">ID: {ticket.ticketId}</p>
            <p className="text-slate-400 text-sm mb-6">
              Assigned: {ticket.assignedTo?.full_name || "Staff"}
            </p>
            <p className="text-white mb-6">Is your issue resolved?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleResolve}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
              >
                ✅ Yes, Resolved
              </button>
              <button
                onClick={() => setStatus("pending")}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
              >
                ❌ Still Pending
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h1 className="text-2xl font-bold text-white mb-2">Ticket Resolved!</h1>
            <p className="text-slate-400">{ticket?.title}</p>
          </>
        )}

        {status === "pending" && (
          <>
            <p className="text-5xl mb-4">⏳</p>
            <h1 className="text-2xl font-bold text-amber-400 mb-2">Issue Still Pending</h1>
            <p className="text-slate-400">Staff will follow up soon.</p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-5xl mb-4">❌</p>
            <h1 className="text-2xl font-bold text-rose-400">Ticket Not Found</h1>
          </>
        )}
      </div>
    </div>
  );
}