import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || ""); // Persist role across refreshes

  // Sync role state with localStorage whenever it changes
  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  // Function to handle logout (clear role and local storage)
  const handleLogout = () => {
    setRole("");
    localStorage.removeItem("role");
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
            <ProtectedRoute roleRequired="admin" role={role}>
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
            role === "admin" ? (
              <Navigate to="/admin-dashboard" />
            ) : role === "business" ? (
              <Navigate to="/client-dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
