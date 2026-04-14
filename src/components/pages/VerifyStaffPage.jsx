import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyStaffPage() {
  const { staffId } = useParams();
  const [status, setStatus] = useState("loading");
  const [staffInfo, setStaffInfo] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/verify/${staffId}`)
      .then((res) => {
        setStaffInfo(res.data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [staffId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-md w-full shadow-2xl">
        
        {status === "loading" && (
          <p className="text-white text-xl animate-pulse">Verifying...</p>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-2">Staff Verified!</h1>
            <p className="text-slate-400 mb-6">Presence confirmed successfully</p>

            <div className="bg-slate-800 rounded-xl p-4 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Name</span>
                <span className="text-white font-medium">{staffInfo?.staff?.full_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Department</span>
                <span className="text-indigo-400 font-medium">{staffInfo?.staff?.department || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Ticket Resolved</span>
                <span className="text-emerald-400 font-medium">{staffInfo?.ticket?.title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Time</span>
                <span className="text-slate-300 text-sm">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-rose-400 mb-2">Verification Failed</h1>
            <p className="text-slate-400">No active ticket found for this staff</p>
          </>
        )}
      </div>
    </div>
  );
}