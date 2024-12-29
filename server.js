const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Supabase client
const supabase = createClient(
  "https://obrdkvenlrhfkshmbjyz.supabase.co", // Replace with your Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmRrdmVubHJoZmtzaG1ianl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MTY1MTgsImV4cCI6MjA1MDk5MjUxOH0.4WcKZrerboS8MAJrU8GDtgw9Ym7FKf8ZsMPnB-R7PwE" // Replace with your Supabase anon key
);

const JWT_SECRET = "your_secret_key"; // Replace with a secure secret key

// Middleware to validate JWT and user role
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied, token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create User (Admin creating a business or another admin)
app.post("/api/users", authenticateToken, async (req, res) => {
  const { email, password, role, business_name } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can create users" });
  }

  if (!email || !password || !role || (role === "business" && !business_name)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  if (!["admin", "business"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, role, business_name }]);

    if (error) {
      console.error("Create user error:", error.message);
      return res.status(500).json({ error: "Error creating user account" });
    }

    return res.status(201).json({ message: "User account created successfully" });
  } catch (err) {
    console.error("Create user error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete User
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete users" });
  }

  try {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Delete user error:", error.message);
      return res.status(500).json({ error: "Error deleting user account" });
    }

    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update User
app.put("/api/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, password, role, business_name } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can update users" });
  }

  try {
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (role) updates.role = role;
    if (business_name) updates.business_name = business_name;

    const { error } = await supabase.from("users").update(updates).eq("id", id);

    if (error) {
      console.error("Update user error:", error.message);
      return res.status(500).json({ error: "Error updating user account" });
    }

    return res.status(200).json({ message: "User account updated successfully" });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Fetch All Users (Admin Dashboard)
app.get("/api/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can view users" });
  }

  try {
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Fetch users error:", error.message);
      return res.status(500).json({ error: "Error fetching users" });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
