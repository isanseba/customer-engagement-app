import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Button, Modal, Form, Alert, Spinner, Pagination } from "react-bootstrap";
import { Download, ArrowRepeat, Eye } from "react-bootstrap-icons";
import CustomTable from "../components/Table";
import { useNavigate } from "react-router-dom";

const AdminDashboard = ({ handleLogout }) => {
  const [businesses, setBusinesses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "business" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
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
  }, []);

  // Fetch all admins (only for superadmin)
  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setError("");
    try {
      if (role === "superadmin") {
        const { data: adminsData, error: adminsError } = await supabase.from("admins").select("*");
        if (adminsError) throw adminsError;

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, email")
          .in("id", adminsData.map((admin) => admin.id));

        if (usersError) throw usersError;

        const adminsWithEmails = adminsData.map((admin) => {
          const user = usersData.find((user) => user.id === admin.id);
          return { ...admin, email: user ? user.email : "N/A" };
        });

        setAdmins(adminsWithEmails);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      setError("Failed to load admins. Please try again.");
    } finally {
      setAdminsLoading(false);
    }
  }, [role]);

  // Handle refresh data
  const handleRefreshData = () => {
    fetchBusinesses();
    fetchAdmins();
  };

  // Handle export data
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + businesses.map(b => Object.values(b).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "businesses.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Handle create account
  const handleCreateAccount = async () => {
    setError("");
    setSuccess("");
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ name: formData.name, email: formData.email, role: formData.role }])
        .select()
        .single();

      if (error) throw error;

      if (formData.role === "business") {
        await supabase.from("businesses").insert([{ id: data.id, name: formData.name, email: formData.email }]);
      } else if (formData.role === "admin" || formData.role === "superadmin") {
        await supabase.from("admins").insert([{ id: data.id, role: formData.role }]);
      }

      setSuccess("Account created successfully!");
      setShowCreateAccountModal(false);
      fetchBusinesses();
      fetchAdmins();
    } catch (error) {
      console.error("Error creating account:", error.message);
      setError("Failed to create account. Please try again.");
    }
  };

  // Handle update last payment
  const handleUpdateLastPayment = async (id, date) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ last_payment: date })
        .eq("id", id);

      if (error) throw error;
      fetchBusinesses();
    } catch (error) {
      console.error("Error updating last payment:", error.message);
      setError("Failed to update last payment. Please try again.");
    }
  };

  // Calculate payment status
  const calculatePaymentStatus = (lastPayment) => {
    if (!lastPayment) return "No Payment";
    const paymentDate = new Date(lastPayment);
    const today = new Date();
    const diffTime = Math.abs(today - paymentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? "Active" : "Inactive";
  };

  // Calculate service status
  const calculateServiceStatus = (lastPayment) => {
    if (!lastPayment) return "Inactive";
    const paymentDate = new Date(lastPayment);
    const today = new Date();
    const diffTime = Math.abs(today - paymentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? "Active" : "Inactive";
  };

  // Handle reset password
  const handleResetPassword = async (id, email) => {
    try {
      const newPassword = "TempPassword123";
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;
      setSuccess(`Password reset to ${newPassword} for ${email}`);
    } catch (error) {
      console.error("Error resetting password:", error.message);
      setError("Failed to reset password. Please try again.");
    }
  };

  // Handle delete business
  const handleDeleteBusiness = async (id) => {
    try {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
      fetchBusinesses();
      setSuccess("Business deleted successfully!");
    } catch (error) {
      console.error("Error deleting business:", error.message);
      setError("Failed to delete business. Please try again.");
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (id) => {
    try {
      const { error } = await supabase.from("admins").delete().eq("id", id);
      if (error) throw error;
      fetchAdmins();
      setSuccess("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error.message);
      setError("Failed to delete admin. Please try again.");
    }
  };

  // Filter businesses based on search query
  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate businesses
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchBusinesses();
    fetchAdmins();
  }, [fetchBusinesses, fetchAdmins]);

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
        <Button onClick={handleRefreshData} variant="info" className="ms-2">
          <ArrowRepeat /> Refresh Data
        </Button>
        <Button onClick={handleExportData} variant="success" className="ms-2">
          <Download /> Export Data
        </Button>
      </div>

      {/* Create Account Modal */}
      <Modal show={showCreateAccountModal} onHide={() => setShowCreateAccountModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={role !== "superadmin"}
              >
                <option value="business">Business</option>
                {role === "superadmin" && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateAccountModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateAccount}>
            Create Account
          </Button>
        </Modal.Footer>
      </Modal>

      <h3>Businesses</h3>
      <input
        type="text"
        placeholder="Search businesses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />
      {businessesLoading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <CustomTable
            data={paginatedBusinesses}
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Email", accessor: "email" },
              { header: "Phone", accessor: "phone" },
              { header: "Created At", accessor: "created_at" },
              {
                header: "Last Payment",
                accessor: "last_payment",
                render: (row) => (
                  <input
                    type="date"
                    value={row.last_payment ? row.last_payment.split("T")[0] : ""}
                    onChange={(e) => handleUpdateLastPayment(row.id, e.target.value)}
                  />
                ),
              },
              {
                header: "Payment Status",
                accessor: "last_payment",
                render: (row) => calculatePaymentStatus(row.last_payment),
              },
              {
                header: "Service Status",
                accessor: "last_payment",
                render: (row) => calculateServiceStatus(row.last_payment),
              },
            ]}
            actions={[
              {
                label: "View Dashboard",
                variant: "info",
                icon: <Eye />,
                onClick: (row) => navigate(`/business-dashboard/${row.id}`),
              },
              {
                label: "Reset Password",
                variant: "warning",
                onClick: (row) => handleResetPassword(row.id, row.email),
              },
              {
                label: "Delete",
                variant: "danger",
                onClick: (row) => handleDeleteBusiness(row.id),
              },
            ]}
          />
          <Pagination>
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: Math.ceil(filteredBusinesses.length / itemsPerPage) }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredBusinesses.length / itemsPerPage)}
            />
          </Pagination>
        </>
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
                  label: "Reset Password",
                  variant: "warning",
                  onClick: (row) => handleResetPassword(row.id, row.email),
                },
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