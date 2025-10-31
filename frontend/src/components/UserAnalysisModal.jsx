import React, { useState, useMemo } from "react";

const UserAnalysisModal = ({ user, analyses, onClose }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Hooks must always be called before any return statement
  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    return analyses
      .filter((a) => {
        const matchesSearch = a.url?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          filter === "All" || a.risk?.level?.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [analyses, search, filter]);

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginated = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Return placed after all hooks
  if (!user) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target.classList.contains("modal") && onClose()}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-light rounded-4 shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title text-info">
              🔍 Analysis History — {user.name} ({user.email})
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Filters */}
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control w-50"
                placeholder="Search by URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="form-select w-25"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Safe">Safe</option>
                <option value="Suspicious">Suspicious</option>
                <option value="Phishing">Phishing</option>
              </select>
            </div>

            {paginated.length === 0 ? (
              <p className="text-muted text-center mt-3">
                No analyses found for this filter.
              </p>
            ) : (
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Country</th>
                    <th>Risk Level</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr key={a._id}>
                      <td>{a.url}</td>
                      <td>{a.country || "N/A"}</td>
                      <td
                        className={
                          a.risk.level === "Phishing"
                            ? "text-danger fw-bold"
                            : a.risk.level === "Suspicious"
                            ? "text-warning fw-bold"
                            : "text-success fw-bold"
                        }
                      >
                        {a.risk.level}
                      </td>
                      <td>{a.risk.score}</td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-3">
                <button
                  className="btn btn-outline-light btn-sm me-2"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ⬅ Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-outline-light btn-sm ms-2"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next ➡
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalysisModal;

