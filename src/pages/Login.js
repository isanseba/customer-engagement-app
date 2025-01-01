import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log("Login response:", data); // Debug: Log the response

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Store token and role securely
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setRole(data.role); // Update the role state

      // Redirect based on role
      if (data.role === "superadmin" || data.role === "admin") {
        console.log("Navigating to /admin-dashboard"); // Debug: Log navigation
        navigate("/admin-dashboard", { replace: true });
        console.log("Navigation to /admin-dashboard completed"); // Debug: Confirm navigation
      } else if (data.role === "business") {
        console.log("Navigating to /client-dashboard"); // Debug: Log navigation
        navigate("/client-dashboard", { replace: true });
        console.log("Navigation to /client-dashboard completed"); // Debug: Confirm navigation
      } else {
        throw new Error("Invalid role received from server");
      }
    } catch (err) {
      console.error("Login error:", err); // Debug: Log the error
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;