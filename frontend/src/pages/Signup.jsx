import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser, loginUser } from "../services/apiService";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Handle signup form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert("❌ Passwords do not match!");
    }

    setLoading(true);
    try {
      // 🧠 Register user
      await signupUser(formData);

      // 🔑 Auto-login immediately after signup
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Save credentials locally
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // 🚀 Redirect by role
      if (data.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      alert(`✅ Welcome, ${data.name}! Your account has been created.`);
    } catch (err) {
      console.error("Signup Error:", err);
      alert(err.response?.data?.message || "Failed to register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card shadow-lg p-4 border-0"
        style={{
          maxWidth: "450px",
          width: "100%",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-center text-info fw-bold mb-4">🧾 Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          {/* 🎭 Role Selection */}
          <div className="mb-3">
            <label className="form-label text-light">Select Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-muted mt-3">
          Already have an account?{" "}
          <Link to="/" className="text-info fw-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
