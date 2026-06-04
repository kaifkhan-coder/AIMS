import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import "./index.css";
import { ThemeProvider } from "./components/pages/ThemeContext.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </HashRouter>
);