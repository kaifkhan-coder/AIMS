import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function VerifyStaffPage() {
  const { staffId } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    api.get(`/admin/verify/${staffId}`)
      .then(() => setMessage("✅ Verified Successfully!"))
      .catch(() => setMessage("❌ Verification Failed"));
  }, [staffId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <h1 className="text-3xl font-bold text-white">{message}</h1>
    </div>
  );
}