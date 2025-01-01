import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Alert, Spinner, Form } from "react-bootstrap";

const ClientDashboard = ({ handleLogout, isAdminView = false }) => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const fetchBusiness = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setBusiness(data);
      setFormData({ name: data.name, email: data.email, phone: data.phone });
    } catch (error) {
      console.error("Error fetching business:", error.message);
      setError("Failed to load business details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateBusiness = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update(formData)
        .eq("id", id);

      if (error) throw error;
      setBusiness({ ...business, ...formData });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating business:", error.message);
      setError("Failed to update business details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  return (
    <div className="container mt-5">
      <h1>{isAdminView ? "Business Dashboard" : "Client Dashboard"}</h1>
      <Button onClick={handleLogout} variant="danger" className="mb-3">
        Logout
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="mt-4">
          {editMode ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleUpdateBusiness}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditMode(false)} className="ms-2">
                Cancel
              </Button>
            </Form>
          ) : (
            <>
              <h2>{business.name}</h2>
              <p>
                <strong>Email:</strong> {business.email}
              </p>
              <p>
                <strong>Phone:</strong> {business.phone}
              </p>
              <p>
                <strong>Last Payment:</strong> {business.last_payment}
              </p>

              {(role === "superadmin" || !isAdminView) && (
                <Button variant="info" onClick={() => setEditMode(true)}>
                  Edit Business Details
                </Button>
              )}

              {isAdminView && (
                <div className="mt-4">
                  <Button variant="info" onClick={() => navigate(`/admin-dashboard`)}>
                    Back to Admin Dashboard
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;