import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
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
      setLoginSuccess(true); // Trigger navigation
    } catch (err) {
      console.error("Login error:", err); // Debug: Log the error
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate after role is updated
  useEffect(() => {
    if (loginSuccess) {
      const role = localStorage.getItem("role");
      if (role === "superadmin" || role === "admin") {
        console.log("Navigating to /admin-dashboard"); // Debug: Log navigation
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "business") {
        console.log("Navigating to /client-dashboard"); // Debug: Log navigation
        navigate("/client-dashboard", { replace: true });
      }
      setLoginSuccess(false); // Reset the flag
    }
  }, [loginSuccess, navigate]);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;