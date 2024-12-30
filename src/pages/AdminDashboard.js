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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
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

  // Fetch all admins
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from("admins").select("*");
      if (error) throw error;
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      setError("Failed to load admins. Please try again.");
    } finally {
      setAdminsLoading(false);
    }
  };

  // Add a new business
  const handleAddBusiness = async () => {
    setError("");
    setSuccess("");

    // Basic form validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const { error } = await supabase.from("businesses").insert([{ ...formData }]);
      if (error) throw error;
      setSuccess("Business added successfully!");
      fetchBusinesses();
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error adding business:", error.message);
      setError("Failed to add business. Please try again.");
    }
  };

  // Delete a business
  const handleDeleteBusiness = async (id) => {
    setError("");
    setSuccess("");

    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this business?")) {
      return;
    }

    try {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
      setSuccess("Business deleted successfully!");
      fetchBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error.message);
      setError("Failed to delete business. Please try again.");
    }
  };

  // Delete an admin (Superadmin only)
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
      const { error } = await supabase.from("admins").delete().eq("id", id);
      if (error) throw error;
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
        <Button onClick={() => setShowModal(true)}>Add Business</Button>
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
            { header: "Phone", accessor: "phone" },
          ]}
          actions={[
            { label: "Delete", variant: "danger", onClick: (row) => handleDeleteBusiness(row.id) },
          ]}
          loading={businessesLoading} // Pass loading prop
        />
      )}

      <h3>Admins</h3>
      {adminsLoading ? (
        <Spinner animation="border" />
      ) : (
        <CustomTable
          data={admins}
          columns={[{ header: "Email", accessor: "email" }]}
          actions={
            role === "superadmin"
              ? [
                  {
                    label: "Remove",
                    variant: "danger",
                    onClick: (row) => handleDeleteAdmin(row.id),
                  },
                ]
              : []
          }
          loading={adminsLoading} // Pass loading prop
        />
      )}

      {/* Add Business Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Business</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddBusiness}>
            Add Business
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;