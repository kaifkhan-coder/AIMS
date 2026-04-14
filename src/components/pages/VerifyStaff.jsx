import { useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyStaff() {
  const { staffId } = useParams();

  const handleVerify = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verify`,
        { staffId }
      );
      alert("✅ Ticket Verified Successfully");
    } catch (err) {
      alert("❌ Verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Verify Staff Work</h1>

      <button
        onClick={handleVerify}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Confirm Work Done
      </button>
    </div>
  );
}