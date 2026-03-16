import React, { useState } from "react";
import api from "../../services/api";

export default function BlockedAccount({ username, reason }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitAppeal = async () => {
    try {
      setLoading(true);
      await api.post("/account-appeals/submit", {
        username,
        message,
      });
      alert("Appeal submitted successfully");
      setMessage("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit appeal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl bg-slate-900 text-white">
      <h2 className="text-2xl font-bold mb-3">Account Blocked</h2>
      <p className="mb-2">Your account has been blocked/deactivated.</p>
      <p className="mb-4 text-red-300">Reason: {reason}</p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your appeal..."
        className="w-full p-3 rounded bg-slate-800 mb-3"
      />

      <button
        onClick={submitAppeal}
        disabled={loading}
        className="w-full bg-indigo-600 p-3 rounded"
      >
        {loading ? "Submitting..." : "Submit Appeal"}
      </button>
    </div>
  );
}