import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min countdown
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });
      alert("✅ Account verified. You can login now.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await axios.post("${import.meta.env.VITE_API_URL}/api/auth/resend-otp", { email });
    setTimeLeft(600); // reset timer
    alert("OTP resent to your email");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-center">Verify Account</h2>

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <p className="text-sm text-gray-600">Expires in ⏳ {minutes}:{seconds.toString().padStart(2, "0")}</p>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {timeLeft === 0 && (
          <button type="button" onClick={resendOtp} className="text-blue-600 underline text-sm mt-2">
            Resend OTP
          </button>
        )}
      </form>
    </div>
  );
}
