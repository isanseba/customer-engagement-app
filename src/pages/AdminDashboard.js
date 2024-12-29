import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Table, Button, Modal, Form } from "react-bootstrap";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const fetchBusinesses = async () => {
    setLoading(true);
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

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.from("admins").select("*"); // Assuming you have an admins table
      if (error) throw error;
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error.message);
    }
  };

  const handleAddBusiness = async () => {
    try {
      const { error } = await supabase
        .from("businesses")
        .insert([{ ...formData }]);
      if (error) throw error;
      fetchBusinesses();
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error adding business:", error.message);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchAdmins();
  }, []);

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>
      {error && <p className="text-danger">{error}</p>}
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add Business
      </Button>
      <h3>Businesses</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((business) => (
            <tr key={business.id}>
              <td>{business.name}</td>
              <td>{business.email}</td>
              <td>{business.phone}</td>
              <td>
                <Button variant="danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Admins</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.email}</td>
              <td>
                <Button variant="danger">Remove</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
