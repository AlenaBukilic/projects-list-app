import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Modal from "./Modal";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 5000,
});

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchApplied, setSearchApplied] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    status: "",
    applicant: "",
    place: "",
    user: "",
  });
  const [createError, setCreateError] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async (search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("/api/projects", { params });
      setProjects(response.data.data || []);
      setSearchApplied(response.data.searchApplied || false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchProjects("");
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      await api.post("/api/project", createForm);
      setShowCreateForm(false);
      setCreateForm({
        name: "",
        status: "",
        applicant: "",
        place: "",
        user: "",
      });
      fetchProjects(searchTerm);
    } catch (err) {
      setCreateError(err.response?.data?.error || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pending")) return "pending";
    if (statusLower.includes("approved")) return "approved";
    if (statusLower.includes("rejected")) return "rejected";
    if (statusLower.includes("progress")) return "in-progress";
    return "pending";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Projects List</h1>
          <p>Displaying project data from PostgreSQL database</p>
        </div>
        <div className="loading">
          <h3>Loading projects...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Projects List</h1>
        <p>Displaying project data from PostgreSQL database</p>
      </div>

      <div className="controls">
        {/* Plus Button for Create New */}
        <button
          className="plus-button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          disabled={loading || creating}
          title={showCreateForm ? "Cancel" : "Create New Project"}
          style={{ marginLeft: "0.5rem", fontSize: "1.5rem", width: "2.5rem", height: "2.5rem", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
        >
          {showCreateForm ? "×" : "+"}
        </button>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Project ID, Applicant, or Project Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              Search
            </button>
            {searchApplied && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="clear-button"
                disabled={loading}
              >
                Clear
              </button>
            )}
          </div>
        </form>
        <button
          className="refresh-button"
          onClick={() => fetchProjects(searchTerm)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
        <h2 style={{ marginTop: 0 }}>Create New Project</h2>
        <form onSubmit={handleCreateProject} className="create-form">
          <div>
            <label>Project Name:</label>
            <input
              type="text"
              name="name"
              value={createForm.name}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          <div>
            <label>Status:</label>
            <input
              type="text"
              name="status"
              value={createForm.status}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          <div>
            <label>Applicant:</label>
            <input
              type="text"
              name="applicant"
              value={createForm.applicant}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          <div>
            <label>Place:</label>
            <input
              type="text"
              name="place"
              value={createForm.place}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          <div>
            <label>User:</label>
            <input
              type="text"
              name="user"
              value={createForm.user}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          {createError && (
            <div className="error" style={{ marginTop: "0.5rem" }}>
              <strong>Error:</strong> {createError}
            </div>
          )}
          <button
            type="submit"
            disabled={creating}
            style={{ marginTop: "1rem" }}
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </form>
      </Modal>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {searchApplied && (
        <div className="search-info">
          <p>
            Showing {projects.length} result(s) for "{searchTerm}"
          </p>
        </div>
      )}

      <div className="projects-table">
        <div className="table-header">
          <h2>Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 && !error ? (
          <div className="empty-state">
            <h3>No projects found</h3>
            <p>
              {searchApplied
                ? `No projects match your search for "${searchTerm}". Try a different search term.`
                : "There are no projects in the database yet."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Project ID</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Applicant</th>
                  <th>Place</th>
                  <th>User</th>
                  <th>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project["project id"] || index}>
                    <td>{project["project id"] || "N/A"}</td>
                    <td>{project["project name"] || "N/A"}</td>
                    <td>
                      <span
                        className={`status ${getStatusClass(project.status)}`}
                      >
                        {project.status || "N/A"}
                      </span>
                    </td>
                    <td>{project.applicant || "N/A"}</td>
                    <td>{project.place || "N/A"}</td>
                    <td>{project.user || "N/A"}</td>
                    <td>{formatDate(project["submission date"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
