export default function Docs() {
  return (
    <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
      <h1 className="text-4xl text-[#05d9e8] mb-6">API Documentation</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-[#ff2a6d]">POST /api/incidents</h2>
          <p className="text-white/60">Create new incident</p>
        </div>

        <div>
          <h2 className="text-[#ff2a6d]">GET /api/incidents/my</h2>
          <p className="text-white/60">Get user tickets</p>
        </div>

        <div>
          <h2 className="text-[#ff2a6d]">PUT /api/incidents/:id/status</h2>
          <p className="text-white/60">Update ticket status</p>
        </div>

        <div>
          <h2 className="text-[#ff2a6d]">GET /api/incidents/predict-sla-risk</h2>
          <p className="text-white/60">Predict SLA risk</p>
        </div>
      </div>
    </div>
  );
}