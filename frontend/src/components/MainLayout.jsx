import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e0e0e0",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div className="container py-4">{children}</div>
    </div>
  );
};

export default MainLayout;
