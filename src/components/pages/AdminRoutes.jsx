import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
