import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { supabase } from "./supabaseClient"; // Import Supabase client
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || ""); // Persist role across refreshes

  // Sync role state with localStorage whenever it changes
  useEffect(() => {
    console.log("Current role:", role); // Debug: Log the role
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Clear Supabase session
      setRole(""); // Clear role state
      localStorage.removeItem("role"); // Remove role from storage
      localStorage.removeItem("token"); // Clear token for added security
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login setRole={setRole} />} />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleRequired={["superadmin", "admin"]} role={role}>
              <AdminDashboard handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Client Dashboard Route */}
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute roleRequired="business" role={role}>
              <ClientDashboard handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Default Route: Redirect based on role */}
        <Route
          path="*"
          element={
            role === "superadmin" || role === "admin" ? (
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