import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { analyzeWebsite } from "../services/apiService";
import ThemeToggle from "../components/ThemeToggle";


const Dashboard = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  // 🌗 Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme === "dark" ? "dark-mode" : "light-mode";
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-mode" : "light-mode";
  }, [theme]);

  // 🚪 Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  // 🧠 Analyze website
  const handleAnalyze = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first.");
    if (!url.trim()) return alert("Please enter a website URL");

    setLoading(true);
    setData(null);
    setAnimatedScore(0);

    try {
      const result = await analyzeWebsite(token, url);
      setData(result);
    } catch (err) {
      alert("Failed to analyze website");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Press Enter to analyze
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAnalyze();
    }
  };

  // 🎬 Animate risk score smoothly
  useEffect(() => {
    if (!data?.risk?.score) return;

    const target = data.risk.score;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(target * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(target);
      }
    };

    requestAnimationFrame(animate);
  }, [data]);

  const renderRow = (label, value) => (
    <tr>
      <th style={{ width: "35%" }}>{label}</th>
      <td>{value || "— Not Available —"}</td>
    </tr>
  );

  return (
    <div className="container py-5">
      {/* 🔷 Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow-sm header-bar">
        <h4 className="fw-bold m-0 text-info">🚨 Suspicious Website Analyzer</h4>

        <div className="d-flex align-items-center">
          {/* Theme Toggle */}
          <button
            className="btn btn-sm btn-outline-info me-3"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* Profile */}
          <Link
            to="/profile"
            className="btn btn-sm btn-outline-light me-3"
            style={{ borderRadius: "8px" }}
          >
            👤 View Profile
          </Link>

          {/* 🚪 Logout */}
          <button
            className="btn btn-sm btn-danger"
            style={{ borderRadius: "8px" }}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <h2 className="text-center mb-4 fw-bold text-primary">
        🌐 Website Analyzer Dashboard
      </h2>

      {/* Input Section */}
      <div className="d-flex justify-content-center mb-4">
        <input
          type="text"
          className="form-control me-2 shadow-sm"
          placeholder="Enter website URL… (e.g. https://example.com)"
          style={{
            maxWidth: "500px",
            borderRadius: "10px",
            padding: "10px",
          }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary shadow-sm px-4"
          style={{ borderRadius: "10px" }}
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      {/* Results */}
      {data && (
        <div
          className="card shadow-lg p-4 mx-auto border-0"
          style={{
            maxWidth: "850px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h5 className="fw-bold text-center text-info mb-3">
            🌐 Complete Website Report
          </h5>

          {data.risk && (
            <div
              className="card p-4 shadow-sm border-0 mb-4"
              style={{
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <h4 className="fw-bold text-center mb-3 text-light">
                🧠 Risk Analysis
              </h4>

              <div className="text-center mb-2">
                <strong className="fs-5">Overall Score:</strong>{" "}
                <span className="fs-5 fw-bold text-info">
                  {animatedScore}/100
                </span>{" "}
                <span
                  className={`badge ms-2 ${
                    data.risk.level === "Safe"
                      ? "bg-success"
                      : data.risk.level === "Suspicious"
                      ? "bg-warning text-dark"
                      : "bg-danger"
                  }`}
                >
                  {data.risk.level}
                </span>
              </div>

              <div className="progress mb-3" style={{ height: "28px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{
                    width: `${animatedScore}%`,
                    transition: "width 0.2s ease-in-out",
                    background:
                      data.risk.level === "Safe"
                        ? "linear-gradient(90deg, #22c55e, #86efac)"
                        : data.risk.level === "Suspicious"
                        ? "linear-gradient(90deg, #facc15, #f59e0b)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                    color: "#0f172a",
                    fontWeight: "bold",
                    borderRadius: "20px",
                  }}
                >
                  {data.risk.level}
                </div>
              </div>

              <h6 className="fw-semibold mt-3 text-light">🧾 Reasons:</h6>
              <ul className="mb-0">
                {data.risk.reasons.length > 0 ? (
                  data.risk.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))
                ) : (
                  <li>No specific risk factors detected.</li>
                )}
              </ul>
            </div>
          )}

          <table className="table table-striped">
            <tbody>
              {renderRow("Input URL", data.input)}
              {renderRow("Domain", data.domain)}
              {renderRow("Resolved IPs", data.resolvedIPs?.join(", "))}
              {renderRow("HTTP Status", data.http?.status)}
              {renderRow("Final URL", data.http?.finalUrl)}
              {renderRow("Page Title", data.http?.title)}
              {renderRow("Meta Description", data.http?.metaDescription)}
              {renderRow("Content Type", data.http?.contentType)}
              {renderRow("Created Date", data.domainsdb?.create_date)}
              {renderRow("Updated Date", data.domainsdb?.update_date)}
              {renderRow("Country", data.geo?.country)}
              {renderRow("Region", data.geo?.region)}
              {renderRow("City", data.geo?.city)}
              {renderRow("ISP", data.geo?.isp)}
              {renderRow(
                "Registrar",
                data.rdap?.entities?.[0]?.vcardArray?.[1]?.[1]?.[3]
              )}
              {renderRow("TLS Issuer", data.tls?.issuer)}
              {renderRow("TLS Valid From", data.tls?.validFrom)}
              {renderRow("TLS Valid To", data.tls?.validTo)}
              {renderRow(
                "PhishTank Result",
                data.phishtank?.valid ? "Phishing Verified" : "No record / safe"
              )}
            </tbody>
          </table>

          <p className="text-center text-muted small mt-3">
            🔍 Data aggregated from DomainsDB, RDAP, IPWho.is, IPAPI, TLS, and
            HTTP headers
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
