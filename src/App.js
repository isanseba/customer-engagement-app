import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { supabase } from "./supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== role) {
      setRole(storedRole);
    }
  }, [role]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      setRole(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setRole={setRole} />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleRequired={["superadmin", "admin"]} role={role}>
              <AdminDashboard handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute roleRequired="business" role={role}>
              <ClientDashboard handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business-dashboard/:id"
          element={
            <ProtectedRoute roleRequired={["superadmin", "admin"]} role={role}>
              <ClientDashboard handleLogout={handleLogout} isAdminView={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            !role ? (
              <Navigate to="/login" replace />
            ) : role === "superadmin" || role === "admin" ? (
              <Navigate to="/admin-dashboard" replace />
            ) : role === "business" ? (
              <Navigate to="/client-dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;