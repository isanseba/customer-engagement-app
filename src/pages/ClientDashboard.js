import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");

      try {
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
          throw new Error("No active session found. Please log in again.");
        }

        const userId = sessionData.session.user.id;

        // Fetch the user record where the role is "business"
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .eq("role", "business") // Ensure it's a business user
          .single();

        if (userError) {
          if (userError.code === "PGRST116") {
            throw new Error("No business account found for the logged-in user.");
          }
          throw userError;
        }

        setUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err.message);
        setError("Failed to load your account details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error during logout:", err.message);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleCopyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      alert("API Key copied to clipboard!");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Client Dashboard</h1>
      <button style={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <div style={styles.userInfo}>
          <h2>Welcome, {user.business_name || "User"}!</h2>
          <p>
            <strong>Contact Email:</strong> {user.contact_email}
          </p>
          <p>
            <strong>API Key:</strong>{" "}
            {user.api_key ? (
              <>
                {user.api_key}{" "}
                <button style={styles.copyButton} onClick={handleCopyApiKey}>
                  Copy
                </button>
              </>
            ) : (
              "Not set"
            )}
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  logoutButton: {
    background: "red",
    color: "white",
    border: "none",
    padding: "10px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "20px",
  },
  userInfo: {
    marginTop: "20px",
  },
  copyButton: {
    background: "blue",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginLeft: "10px",
    cursor: "pointer",
  },
};

export default ClientDashboard;
