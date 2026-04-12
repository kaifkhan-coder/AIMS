import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyStaffPage() {
  const { staffId } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/verify/${staffId}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [staffId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-md w-full">
        {status === "loading" && <p className="text-white text-xl">Verifying...</p>}
        {status === "success" && (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h1 className="text-2xl font-bold text-white mb-2">Staff Verified!</h1>
            <p className="text-slate-400">Presence confirmed successfully</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-5xl mb-4">❌</p>
            <h1 className="text-2xl font-bold text-rose-400">Verification Failed</h1>
          </>
        )}
      </div>
    </div>
  );
}