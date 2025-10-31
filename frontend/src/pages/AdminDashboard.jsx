import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserAnalysisModal from "../components/UserAnalysisModal";

const API_BASE_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    totalAnalyses: 0,
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 For modal popup
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalyses, setUserAnalyses] = useState([]);

  // 🔒 Restrict access to Admins only
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "Admin") {
      alert("Access denied! Admins only.");
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [navigate, token]);

  // 📊 Fetch users + stats
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users);

      // 🧮 Fix user/admin counts dynamically
      const userCountFixed = res.data.users.filter(
        (u) => u.role?.toLowerCase() === "user"
      ).length;
      const adminCountFixed = res.data.users.filter(
        (u) => u.role?.toLowerCase() === "admin"
      ).length;

      setStats({
        totalUsers: res.data.users.length,
        adminCount: adminCountFixed,
        userCount: userCountFixed,
        totalAnalyses: res.data.stats.totalAnalyses,
      });
    } catch (err) {
      console.error("Failed to load admin data:", err);
      alert("❌ Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ User added successfully!");
      setUsers([...users, res.data]);
      setNewUser({ name: "", email: "", password: "", role: "User" });
      fetchDashboardData(); // refresh stats
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add user");
    }
  };

  // 💾 Update user
  const handleUpdateUser = async (id, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/users/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ User updated successfully!");
      setEditingUser(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  // 🗑 Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ User deleted successfully!");
      setUsers(users.filter((u) => u._id !== id));
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  // 👁️ View user analysis history
  const handleViewDetails = async (user) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/${user._id}/analyses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(user);
      setUserAnalyses(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch user analysis history");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("👋 Logged out successfully!");
    navigate("/");
  };

  // 🕐 Loading state
  if (loading)
    return (
      <div className="container text-center py-5 text-muted">
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow-sm header-bar">
        <h4 className="fw-bold m-0 text-info">👑 Admin Dashboard</h4>
        <div>
          <Link to="/dashboard" className="btn btn-outline-light me-2">
            🌐 User Dashboard
          </Link>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row text-center mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 bg-dark text-light">
            <h6>Total Users</h6>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 bg-dark text-success">
            <h6>Admins</h6>
            <h3>{stats.adminCount}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 bg-dark text-warning">
            <h6>Users</h6>
            <h3>{stats.userCount}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 bg-dark text-info">
            <h6>Total Analyses</h6>
            <h3>{stats.totalAnalyses}</h3>
          </div>
        </div>
      </div>

      {/* Add New User Form */}
      <div className="card shadow-lg p-4 mb-5 border-0" style={{ borderRadius: "16px" }}>
        <h5 className="fw-bold text-info mb-3 text-center">➕ Add New User</h5>
        <form onSubmit={handleAddUser} className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              placeholder="Name"
              className="form-control"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="col-md-1 d-flex justify-content-center">
            <button type="submit" className="btn btn-success w-100">
              ➕ Add
            </button>
          </div>
        </form>
      </div>

      {/* Manage Users */}
      <div
        className="card shadow-lg p-4 border-0"
        style={{ borderRadius: "16px", background: "rgba(255,255,255,0.05)" }}
      >
        <h5 className="fw-bold text-info mb-3 text-center">👥 Manage Users</h5>
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  {editingUser?._id === u._id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td>{u.email}</td>
                <td>
                  {editingUser?._id === u._id ? (
                    <select
                      className="form-select"
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`badge ${
                        u.role?.toLowerCase() === "admin"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {u.role}
                    </span>
                  )}
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  {editingUser?._id === u._id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleUpdateUser(u._id, editingUser)}
                      >
                        💾 Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingUser(null)}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleViewDetails(u)}
                      >
                        🔍 Details
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => setEditingUser(u)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        🗑 Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing user analyses */}
      {selectedUser && (
        <UserAnalysisModal
          user={selectedUser}
          analyses={userAnalyses}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

