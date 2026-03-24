import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, AlertCircle } from "lucide-react";

function LiveSystemStatus() {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/status")
      .then((res) => setStatusData(res.data))
      .catch(() => setStatusData({ status: "Down" }));
  }, []);

  if (!statusData) {
    return <div className="text-white">Loading...</div>;
  }

  const isHealthy = statusData.status === "Healthy";

  return (
    <div className="bg-slate-800 p-3 rounded-xl border border-slate-600 shadow-xl flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isHealthy ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
        {isHealthy ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
      </div>

      <div>
        <div className="text-xs text-slate-400">System Status</div>
        <div className="text-sm font-bold text-white">
          {statusData.status}
        </div>
        <div className="text-xs text-slate-400">
          Uptime: {Math.floor(statusData.uptime)} sec
        </div>
      </div>
    </div>
  );
}

export default LiveSystemStatus;