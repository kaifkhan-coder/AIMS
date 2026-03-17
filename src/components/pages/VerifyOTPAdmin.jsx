import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const submitOTP = async () => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
      {
        userId: state.userId,
        otp,
      }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-6 rounded-xl w-80">
        <h2 className="text-white text-xl mb-4">Admin OTP</h2>

        <input
          className="w-full p-2 mb-4 bg-slate-700 rounded"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={submitOTP}
          className="w-full bg-indigo-600 py-2 rounded"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
