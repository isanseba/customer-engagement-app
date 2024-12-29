import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import CustomTable from "../components/Table";

const AdminDashboard = ({ handleLogout }) => {
  const [businesses, setBusinesses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Fetch all businesses
  const fetchBusinesses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from("businesses").select("*");
      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error.message);
      setError("Failed to load businesses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from("admins").select("*");
      if (error) throw error;
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      setError("Failed to load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new business
  const handleAddBusiness = async () => {
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

  // Delete an admin
  const handleDeleteAdmin = async (id) => {
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

      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add Business
      </Button>
      <Button onClick={handleLogout} variant="secondary" className="mb-3 ms-2">
        Logout
      </Button>

      <h3>Businesses</h3>
      {loading ? (
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
        />
      )}

      <h3>Admins</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <CustomTable
          data={admins}
          columns={[{ header: "Email", accessor: "email" }]}
          actions={[
            { label: "Remove", variant: "danger", onClick: (row) => handleDeleteAdmin(row.id) },
          ]}
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
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddBusiness}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
