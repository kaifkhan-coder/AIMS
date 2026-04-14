// AuthContext.jsx (simplified)
import { createContext, useContext, useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from token if exists
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token); // Or whatever info you store
      setUser(decoded);
    }
  }, []);




  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
