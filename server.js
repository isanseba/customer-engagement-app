app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Supabase auth error:", error.message); // Debug: Log Supabase error
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Fetch user details to determine their role
    const { user } = data;
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError && adminError.code !== "PGRST116") {
      console.error("Admin lookup error:", adminError.message); // Debug: Log admin lookup error
      return res.status(500).json({ error: "Server error during role lookup" });
    }

    let role = "business"; // Default role is business

    if (adminData) {
      role = adminData.role; // Override with admin or superadmin role
    }

    console.log("Login successful, role:", role); // Debug: Log role
    return res.status(200).json({
      message: "Login successful",
      token: data.session.access_token, // Corrected: Use session.access_token
      role,
    });
  } catch (err) {
    console.error("Login error:", err.message); // Debug: Log error
    res.status(500).json({ error: "Internal server error" });
  }
});