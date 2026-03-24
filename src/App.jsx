import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./components/context/AuthContext.jsx";

import AdminDashboard from "./components/pages/AdminDashboard";
import StaffDashboard from "./components/pages/StaffDashboard";
import UserDashboard from "./components/pages/UserDashboard";
import Login from "./components/pages/Login";
import Register from "./components/pages/register";
import Unauthorized from "./components/pages/Unauthorized";
import VerifyOTP from "./components/pages/VerifyOTP";
import Home from "./components/pages/Home";
import StaffProfile from "./components/pages/StaffProfile.jsx";
import UserProfile from "./components/pages/UserProfile.jsx";
import AdminRoute from "./components/pages/AdminRoutes.jsx";
import VerifyOTPAdmin from "./components/pages/VerifyOTPAdmin.jsx";
import AdminFaceVerify from "./components/pages/AdminFaceVerify.jsx";
import SuperAdminDashboard from "./components/pages/SuperAdminDashboard.jsx";
// import LiveSystemStatus from "./components/pages/Live SystemStatus.jsx";
import LiveSystemStatus from "./components/pages/LiveSystemStatus.jsx";

function App() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ create socket once
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current.on("force_logout", (data) => {
      alert(data?.reason || "Logged out");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      socketRef.current?.disconnect();
      navigate("/login");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [navigate]);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ⚠ you duplicated /verify-otp route twice in your code */}
        <Route path="/verify-otp-admin" element={<VerifyOTPAdmin />} />

        <Route
          path="/super-dashboard"
          element={
            <ProtectedRoute allowedRoles="super_admin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/system-status" element={<LiveSystemStatus />} />
        {/* <Route path="/admin-face-verify" element={<AdminFaceVerify />} /> */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/staff/profile" element={<StaffProfile />} />

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;