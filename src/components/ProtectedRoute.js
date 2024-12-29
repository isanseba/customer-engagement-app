import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ roleRequired, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Retrieve the role from localStorage

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Redirect to "Not Authorized" page if role doesn't match
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/not-authorized" />;
  }

  // Render the protected component if authenticated and authorized
  return children;
};

export default ProtectedRoute;
