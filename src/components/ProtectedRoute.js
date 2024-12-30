import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roleRequired, role, children }) => {
  // Redirect to login if not authenticated
  if (!role) {
    return <Navigate to="/login" />;
  }

  // Redirect to login if role doesn't match
  if (Array.isArray(roleRequired) && !roleRequired.includes(role)) {
    return <Navigate to="/login" />;
  } else if (roleRequired !== role) {
    return <Navigate to="/login" />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;