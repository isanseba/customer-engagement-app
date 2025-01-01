require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or API key is missing. Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Fetch the user from the public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single(); // Ensure only one row is returned

    if (userError) {
      console.error("User Lookup Error:", userError.message);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Step 2: Verify the password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Step 3: Fetch the user's role from the admins table (if applicable)
    let role = "business"; // Default role is business
    if (userData.role === "admin" || userData.role === "superadmin") {
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("role")
        .eq("id", userData.id)
        .single();

      if (adminError && adminError.code !== "PGRST116") {
        console.error("Admin Lookup Error:", adminError.message);
        return res.status(500).json({ error: "Server error during role lookup" });
      }

      if (adminData) {
        role = adminData.role;
      }
    }

    // Step 4: Return success response
    res.status(200).json({
      message: "Login successful",
      token: userData.id, // Use the user ID as a token
      role,
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create user endpoint
app.post("/api/create-user", async (req, res) => {
  const { name, email, role } = req.body;

  // Validate input
  if (!name || !email || !role) {
    return res.status(400).json({ error: "Name, email, and role are required." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Default password
  const defaultPassword = "Default123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  try {
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: defaultPassword,
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError.message);
      return res.status(400).json({ error: "Failed to create user in Auth. Please check the email address." });
    }

    // Step 2: Insert the user into the public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{ id: authData.user.id, name, email, password_hash: passwordHash, role }])
      .select()
      .single();

    if (userError) {
      console.error("User Insertion Error:", userError.message);
      return res.status(500).json({ error: "Failed to create user." });
    }

    // Step 3: Assign the user a role in the appropriate table
    if (role === "admin" || role === "superadmin") {
      const { error: adminError } = await supabase
        .from("admins")
        .insert([{ id: authData.user.id, role }]);

      if (adminError) {
        console.error("Admin Role Assignment Error:", adminError.message);
        return res.status(500).json({ error: "Failed to assign admin role." });
      }
    } else if (role === "business") {
      const { error: businessError } = await supabase
        .from("businesses")
        .insert([{ id: authData.user.id, name, email }]);

      if (businessError) {
        console.error("Business Role Assignment Error:", businessError.message);
        return res.status(500).json({ error: "Failed to assign business role." });
      }
    }

    // Step 4: Return success response
    res.status(200).json({
      message: "User created successfully.",
      user: userData,
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Reset password endpoint
app.post("/api/reset-password", async (req, res) => {
  const { id, email } = req.body;

  try {
    // Generate a new password
    const newPassword = "TempPassword123"; // You can generate a random password here
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the users table
    const { error: userError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", id);

    if (userError) throw userError;

    // Send the new password to the user's email (optional)
    // Implement email sending logic here

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});