import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./components/pages/AdminDashboard";
import StaffDashboard from "./components/pages/StaffDashboard";
import UserDashboard from "./components/pages/UserDashboard";
import Login from "./components/pages/Login";
import Register from "./components/pages/register";
import Unauthorized from "./components/pages/Unauthorized";
import VerifyOTP from "./components/pages/VerifyOTP";
import Home from "./components/pages/Home";
import {useAuth} from './components/context/AuthContext.jsx';
import StaffProfile from "./components/pages/StaffProfile.jsx";
import UserProfile from "./components/pages/UserProfile.jsx";
import { Toaster } from "react-hot-toast";
import AdminRoute from "./components/pages/AdminRoutes.jsx";
import VerifyOTPAdmin from "./components/pages/VerifyOTPAdmin.jsx";
import UserProfileSection from "./components/pages/UserProfileSection.jsx"
import AdminFaceVerify from "./components/pages/AdminFaceVerify.jsx";
function App() {
  const {loading} = useAuth();
  if(loading){
    return <div className="text-center p-10">Loading...</div>
  }
  return (
    
    <>
    <Toaster position="top-right" />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTPAdmin />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles="admin">
          <AdminRoute>
          <AdminDashboard />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="admin-face-verify" element={<AdminFaceVerify/>} />

      <Route path="/staff" element={
        <ProtectedRoute allowedRoles="staff">
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff/profile" element={<StaffProfile />} />

      <Route path="/user" element={
        <ProtectedRoute allowedRoles="user">
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={<UserProfile/>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

    </Routes>
    </>
  );
}

export default App;
