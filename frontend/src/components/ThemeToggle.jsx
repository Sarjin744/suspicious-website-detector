import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * 🌗 ThemeToggle Component
 * Toggles between Dark and Light Mode with smooth transitions + saved preference
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme === "dark" ? "dark-mode" : "light-mode";
    // Save theme
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn theme-toggle-btn fw-semibold"
      style={{
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "8px",
        padding: "8px 16px",
        color: theme === "dark" ? "#ffda79" : "#1e293b",
        background:
          theme === "dark"
            ? "linear-gradient(90deg, #1e293b, #0f172a)"
            : "linear-gradient(90deg, #e0f2fe, #bae6fd)",
        boxShadow:
          theme === "dark"
            ? "0 0 10px rgba(255,255,255,0.15)"
            : "0 0 10px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      {theme === "dark" ? (
        <>
          <Sun className="me-2" size={16} color="#ffda79" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="me-2" size={16} color="#0f172a" />
          Dark Mode
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
