import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/apiService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // 🔐 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(formData);

      // 🧠 Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // ✅ Redirect by role
      if (data.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      alert(`✅ Welcome back, ${data.name}!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Invalid credentials");
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
          maxWidth: "400px",
          width: "100%",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-center text-info fw-bold mb-4">🔐 Login</h3>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-muted mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-info fw-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
