import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getUserAnalyses,
} from "../services/apiService";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({ name: "", email: "", createdAt: "" });
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔹 Load profile + analyses
  useEffect(() => {
    if (!token) return navigate("/");

    const loadProfile = async () => {
      try {
        const data = await getMyProfile(token);
        if (data) {
          setUser(data);
          setForm({ name: data.name || "" });
          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadAnalyses = async () => {
      try {
        const list = await getUserAnalyses(token);
        setAnalyses(list);
      } catch (err) {
        console.error("Failed to load analyses:", err);
      }
    };

    loadProfile();
    loadAnalyses();
  }, [token, navigate]);

  // 💾 Save profile only when Save button is clicked
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!isEditing) return; // ensure only when editing
    setSaving(true);

    try {
      const updated = await updateMyProfile(token, { name: form.name });
      if (updated) {
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // 🔐 Change password logic
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert("New password and confirm password do not match.");
    }
    setPwSaving(true);
    try {
      await changeMyPassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("✅ Password changed successfully!");
    } catch (err) {
      console.error("Change password error:", err);
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading)
    return (
      <div className="container py-5 text-center text-muted">
        Loading profile...
      </div>
    );

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow-sm header-bar">
        <h4 className="fw-bold m-0 text-info">👤 My Profile</h4>
        <Link to="/dashboard" className="btn btn-outline-light">
          🔙 Back to Dashboard
        </Link>
      </div>

      <div
        className="card shadow-lg p-4 mx-auto border-0"
        style={{
          maxWidth: "850px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Profile Info */}
        <h4 className="fw-bold text-center text-info mb-3">User Information</h4>

        <table className="table table-striped mb-3">
          <tbody>
            <tr>
              <th style={{ width: "30%" }}>Name</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      border: "2px solid #0ef",
                      boxShadow: "0 0 10px rgba(0, 255, 255, 0.6)",
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    autoFocus
                  />
                ) : (
                  <span style={{ color: "#e0e0e0", fontWeight: "500" }}>
                    {user.name || "—"}
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td style={{ color: "#e0e0e0" }}>{user.email || "—"}</td>
            </tr>
            <tr>
              <th>Joined</th>
              <td style={{ color: "#e0e0e0" }}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>Total Analyses</th>
              <td style={{ color: "#e0e0e0" }}>{analyses.length}</td>
            </tr>
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="text-center mt-3">
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-outline-warning px-4"
              onClick={() => {
                setForm({ name: user.name || "" });
                setIsEditing(true);
              }}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-success me-2 px-4"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => {
                  setIsEditing(false);
                  setForm({ name: user.name });
                }}
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>

        {/* Change Password Section */}
        <hr className="my-4" />
        <h5 className="fw-bold text-info mb-3 text-center">Change Password</h5>

        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn btn-warning"
              disabled={pwSaving}
            >
              {pwSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>

        {/* Recent Analyses */}
        <hr className="my-4" />
        <h5 className="fw-bold text-info mb-3 text-center">
          Recent Analyses
        </h5>

        {analyses.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Website</th>
                <th>Country</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analyses.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td>{item.url}</td>
                  <td>{item.country || "—"}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-muted">No analyses yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

