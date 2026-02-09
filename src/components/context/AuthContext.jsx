import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios"; // ✅ REQUIRED
import { connectSocket, disconnectSocket } from "../pages/Socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore auth on refresh (ONE SOURCE OF TRUTH)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        setToken(storedToken);
        setUser(res.data); // ✅ profilePhoto included
        connectSocket(storedToken);
      } catch (err) {
        console.error("Auth load failed", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ LOGIN
  const login = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    connectSocket(data.token);
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
