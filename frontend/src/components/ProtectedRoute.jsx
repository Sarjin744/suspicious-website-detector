import React from "react";
import { Navigate } from "react-router-dom";

/**
 * 🔐 ProtectedRoute
 * - Verifies authentication and role access
 * - Redirects unauthorized users safely
 *
 * @param {JSX.Element} children - Component to render if authorized
 * @param {string[]} allowedRoles - Optional array of allowed roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🚫 No token (not logged in)
  if (!token || !user?.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // 🚫 Role not authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert("Access denied. You don’t have permission to view this page.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return children;
};

export default ProtectedRoute;
