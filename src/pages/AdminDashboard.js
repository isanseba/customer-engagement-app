import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import CustomTable from "../components/Table";

const AdminDashboard = ({ handleLogout }) => {
  const [businesses, setBusinesses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "business" });
  const role = localStorage.getItem("role"); // Get the logged-in user's role

  // Fetch all businesses
  const fetchBusinesses = async () => {
    setBusinessesLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from("businesses").select("*");
      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error.message);
      setError("Failed to load businesses. Please try again.");
    } finally {
      setBusinessesLoading(false);
    }
  };

  // Fetch all admins (only for superadmin)
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    setError("");
    try {
      if (role === "superadmin") {
        const { data, error } = await supabase.from("admins").select("*");
        if (error) throw error;
        setAdmins(data);
      } else {
        setAdmins([]); // Normal admins cannot see other admins
      }
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      setError("Failed to load admins. Please try again.");
    } finally {
      setAdminsLoading(false);
    }
  };

  // Create a new account
  const handleCreateAccount = async () => {
    setError("");
    setSuccess("");

    // Basic form validation
    if (!formData.name || !formData.email || !formData.role) {
      setError("Name, Email, and Role are required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccess("Account created successfully!");
      fetchBusinesses(); // Refresh the list of businesses
      fetchAdmins(); // Refresh the list of admins
      setShowCreateAccountModal(false); // Close the modal
      setFormData({ name: "", email: "", role: "business" }); // Clear the form
    } catch (error) {
      console.error("Error creating account:", error.message);
      setError("Failed to create account. Please try again.");
    }
  };

  // Delete a business (only for superadmin)
  const handleDeleteBusiness = async (id) => {
    setError("");
    setSuccess("");

    if (role !== "superadmin") {
      setError("Only superadmins can delete businesses.");
      return;
    }

    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this business?")) {
      return;
    }

    try {
      // Step 1: Delete the business from the businesses table
      const { error: businessError } = await supabase.from("businesses").delete().eq("id", id);
      if (businessError) throw businessError;

      // Step 2: Delete the user from the users table
      const { error: userError } = await supabase.from("users").delete().eq("id", id);
      if (userError) throw userError;

      setSuccess("Business deleted successfully!");
      fetchBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error.message);
      setError("Failed to delete business. Please try again.");
    }
  };

  // Delete an admin (only for superadmin)
  const handleDeleteAdmin = async (id) => {
    setError("");
    setSuccess("");

    if (role !== "superadmin") {
      setError("Only superadmins can delete admins.");
      return;
    }

    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      // Step 1: Delete the admin from the admins table
      const { error: adminError } = await supabase.from("admins").delete().eq("id", id);
      if (adminError) throw adminError;

      // Step 2: Delete the user from the users table
      const { error: userError } = await supabase.from("users").delete().eq("id", id);
      if (userError) throw userError;

      setSuccess("Admin removed successfully!");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error.message);
      setError("Failed to delete admin. Please try again.");
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchAdmins();
  }, []);

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="d-flex mb-3">
        <Button onClick={() => setShowCreateAccountModal(true)}>Create Account</Button>
        <Button onClick={handleLogout} variant="secondary" className="ms-2">
          Logout
        </Button>
      </div>

      <h3>Businesses</h3>
      {businessesLoading ? (
        <Spinner animation="border" />
      ) : (
        <CustomTable
          data={businesses}
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Email", accessor: "email" },
          ]}
          actions={
            role === "superadmin"
              ? [
                  {
                    label: "Delete",
                    variant: "danger",
                    onClick: (row) => handleDeleteBusiness(row.id),
                  },
                ]
              : []
          }
        />
      )}

      {role === "superadmin" && (
        <>
          <h3>Admins</h3>
          {adminsLoading ? (
            <Spinner animation="border" />
          ) : (
            <CustomTable
              data={admins}
              columns={[
                { header: "Email", accessor: "email" },
                { header: "Role", accessor: "role" },
              ]}
              actions={[
                {
                  label: "Remove",
                  variant: "danger",
                  onClick: (row) => handleDeleteAdmin(row.id),
                },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;