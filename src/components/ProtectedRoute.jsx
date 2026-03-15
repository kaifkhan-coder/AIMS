// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ role, children }) {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) return <Navigate to="/login" />;

//   if (role && user.role !== role) return <Navigate to="/login" />;

//   return children;
// }
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function ProtectedRoute({ allowedRoles, children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");  // ✅ fixed

        const u = res.data?.user || res.data;
        const role = u?.role;

        if (!role) {
          setOk(false);
          return;
        }

        if (allowedRoles) {
          const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
          setOk(roles.includes(role));
        } else {
          setOk(true);
        }
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setOk(false);
      }
    })();
  }, [allowedRoles]);

  if (ok === null) return <div className="p-6 text-center">Checking...</div>;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}