import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roleRequired, role, children }) => {
  // Debug: Log role and roleRequired
  console.log("ProtectedRoute - role:", role);
  console.log("ProtectedRoute - roleRequired:", roleRequired);

  // Redirect to login if not authenticated
  if (!role) {
    console.log("ProtectedRoute - Redirecting to /login (no role)"); // Debug: Log redirection
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if role doesn't match
  if (Array.isArray(roleRequired)) {
    // If roleRequired is an array, check if the role is included
    if (!roleRequired.includes(role)) {
      console.log("ProtectedRoute - Redirecting to /login (role mismatch)"); // Debug: Log redirection
      return <Navigate to="/login" replace />;
    }
  } else if (roleRequired !== role) {
    // If roleRequired is a string, check if it matches the role
    console.log("ProtectedRoute - Redirecting to /login (role mismatch)"); // Debug: Log redirection
    return <Navigate to="/login" replace />;
  }

  // Render the protected component
  console.log("ProtectedRoute - Allowing access"); // Debug: Log access
  return children;
};

export default ProtectedRoute;