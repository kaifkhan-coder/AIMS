// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios"; // ✅ REQUIRED
// import { connectSocket, disconnectSocket } from "../pages/Socket";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Restore auth on refresh (ONE SOURCE OF TRUTH)
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) {
//       setLoading(false);
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/users/profile",
//           {
//             headers: {
//               Authorization: `Bearer ${storedToken}`,
//             },
//           }
//         );

//         setToken(storedToken);
//         setUser(res.data); // ✅ profilePhoto included
//         connectSocket(storedToken);
//       } catch (err) {
//         console.error("Auth load failed", err);
//         localStorage.removeItem("token");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   // ✅ LOGIN
//   const login = (data) => {
//     localStorage.setItem("token", data.token);
//     setToken(data.token);
//     setUser(data.user);
//     connectSocket(data.token);
//   };

//   // ✅ LOGOUT
//   const logout = () => {
//     localStorage.removeItem("token");
//     disconnectSocket();
//     setToken(null);
//     setUser(null);
//     window.dispatchEvent(new Event("auth:changed")); // Notify other tabs
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, setUser, token, login, logout, loading }}
//     >
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import api  from "../../services/api.js"; // ✅ use pre-configured api instance
// import { connectSocket, disconnectSocket } from "../pages/Socket";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) {
//       setLoading(false);
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         // const res = await api.get("http://localhost:5000/api/users/profile", {
//         //   headers: {
//         //     Authorization: `Bearer ${storedToken}`,
//         //   },
//         // });
//         const res = await api.get("/auth/me");

//         setToken(storedToken);
//         setUser(res.data.user);
//         connectSocket(storedToken);
//       } catch (err) {
//         console.error("Auth load failed", err);
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         setToken(null);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const login = (data) => {
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     setToken(data.token);
//     setUser(data.user);
//     connectSocket(data.token);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     disconnectSocket();
//     setToken(null);
//     setUser(null);
//     window.dispatchEvent(new Event("auth:changed"));
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import api from "../../services/api.js";
import { connectSocket, disconnectSocket } from "../pages/Socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");

        setToken(storedToken);
        setUser(res.data.user);   // ✅ fixed
        connectSocket(storedToken);
      } catch (err) {
        console.error("Auth load failed", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    connectSocket(data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    disconnectSocket();
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("auth:changed"));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);