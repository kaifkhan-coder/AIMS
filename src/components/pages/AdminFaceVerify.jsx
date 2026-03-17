import React, { useRef, useEffect, useState } from "react";
import axios from "axios";

export default function AdminFaceVerify() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureFace = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    try {
      const res = await axios.post(
        "${process.env.BACKEND_URL}/api/admin/verify-face",
        { image },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        window.location.href = "/admin";
      } else {
        setError("Face not matched");
      }
    } catch (err) {
      setError("Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <video ref={videoRef} autoPlay className="w-96 rounded-xl" />
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={captureFace}
        className="mt-4 px-6 py-3 bg-blue-600 rounded-xl"
      >
        Verify Face
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
