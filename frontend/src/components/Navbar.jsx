// src/components/Navbar.jsx
import React from "react";
import { Brain } from "lucide-react";



const Navbar = () => {
  return (
    <nav
      className="navbar navbar-dark px-4 py-3 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #0f172a, #1e293b, #0a192f)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.1)",
      }}
    >
      <div className="d-flex align-items-center">
        <h3
          className="fw-bold m-0"
          style={{
            color: "#38bdf8",
            textShadow: "0 0 10px rgba(56,189,248,0.7)",
            letterSpacing: "1px",
          }}
        >
          <Brain size={28} className="me-2 text-info" />
          PhishGuard
        </h3>
      </div>
    </nav>
  );
};

export default Navbar;
