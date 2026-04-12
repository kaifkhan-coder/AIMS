import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function VerifyStaffPage() {
  const { staffId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/verify/${staffId}`)
      .then(res => setData(res.data))
      .catch(() => setData({ error: true }));
  }, [staffId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-md w-full">
        {!data ? (
          <p className="text-white">Verifying...</p>
        ) : data.error ? (
          <p className="text-rose-400 text-xl">❌ Verification Failed</p>
        ) : (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h1 className="text-2xl font-bold text-white mb-2">Staff Verified!</h1>
            <p className="text-slate-400">Staff presence confirmed successfully</p>
          </>
        )}
      </div>
    </div>
  );
}