// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ role, children }) {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) return <Navigate to="/login" />;

//   if (role && user.role !== role) return <Navigate to="/login" />;

//   return children;
// }
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role not allowed
  if (
    allowedRoles &&
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;


