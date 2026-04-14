import api from "../../services/api";
import { useState } from "react";

export default function RetrainModelButton() {
  const [loading, setLoading] = useState(false);

  const retrain = async () => {
    try {
      setLoading(true);
      await api.post("/incidents/ml/retrain");
      alert("Model retraining started");
    } catch (err) {
      alert("Failed to retrain model");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={retrain}
      disabled={loading}
      className="bg-indigo-600 px-4 py-2 rounded text-white"
    >
      {loading ? "Retraining..." : "Retrain ML Model"}
    </button>
  );
}
