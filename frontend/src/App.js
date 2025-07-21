import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Modal from "./Modal";
import {
  fetchProjects as fetchProjectsApi,
  createProject as createProjectApi,
  fetchProjectStatuses,
  fetchProjectPlaces,
} from "./api/projects";
import fetchProjectsUtil from "./utils/fetchProjects";
import createProjectUtil from "./utils/createProject";

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
  const [statuses, setStatuses] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState("down");
  const dropdownRef = useRef(null);

  // Adjust dropdown direction based on available space
  useEffect(() => {
    if (!dropdownOpen || !dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      setDropdownDirection("up");
    } else {
      setDropdownDirection("down");
    }
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    fetchProjectsUtil({
      setLoading,
      setError,
      setProjects,
      setSearchApplied,
      fetchProjectsApi,
    });
    // Fetch all statuses for filter
    fetchProjectStatuses().then(res => {
      setStatuses(res.data.statuses || []);
    });
    // Fetch all places for filter
    fetchProjectPlaces().then(res => {
      setPlaces(res.data.places || []);
    });
  }, []);

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handlePlaceChange = (e) => {
    const value = e.target.value;
    setSelectedPlaces((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjectsUtil({
      search: searchTerm,
      status: selectedStatuses,
      place: selectedPlaces,
      setLoading,
      setError,
      setProjects,
      setSearchApplied,
      fetchProjectsApi,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setSelectedPlaces([]);
    fetchProjectsUtil({
      setLoading,
      setError,
      setProjects,
      setSearchApplied,
      fetchProjectsApi,
    });
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = (e) => {
    createProjectUtil({
      e,
      createForm,
      setCreating,
      setCreateError,
      setShowCreateForm,
      setCreateForm,
      fetchProjectsUtil,
      searchTerm,
      setLoading,
      setError,
      setProjects,
      setSearchApplied,
      createProjectApi,
      fetchProjectsApi,
    });
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
          style={{
            marginLeft: "0.5rem",
            fontSize: "1.5rem",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {showCreateForm ? "×" : "+"}
        </button>

        {/* Multi-select status and place filter as dropdown */}
        {(statuses.length > 0 || places.length > 0) && (
          <div style={{ position: "relative", minWidth: 180 }} ref={dropdownRef}>
            <button
              type="button"
              className="search-button"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 140, padding: "0.75rem 1rem", background: dropdownOpen ? "#764ba2" : undefined }}
              onClick={() => setDropdownOpen((open) => !open)}
              tabIndex={0}
            >
              <span style={{ fontWeight: 500, fontSize: 14 }}>
                {selectedStatuses.length === 0 && selectedPlaces.length === 0
                  ? "Filter"
                  : `${selectedStatuses.length} status, ${selectedPlaces.length} city`}
              </span>
              <span style={{ marginLeft: 8, fontSize: 16 }}>{dropdownOpen ? "▲" : "▼"}</span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  [dropdownDirection === "down" ? "top" : "bottom"]: "110%",
                  left: 0,
                  zIndex: 10,
                  background: "#fff",
                  border: "1px solid #e1e5e9",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(102,126,234,0.10)",
                  padding: 10,
                  minWidth: 180,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {statuses.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Status</div>
                    {statuses.map((status) => (
                      <label key={status} style={{ display: "flex", alignItems: "center", fontWeight: 400, fontSize: 14, marginBottom: 4, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          value={status}
                          checked={selectedStatuses.includes(status)}
                          onChange={handleStatusChange}
                          style={{ marginRight: 6 }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                )}
                {places.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>City</div>
                    {places.map((place) => (
                      <label key={place} style={{ display: "flex", alignItems: "center", fontWeight: 400, fontSize: 14, marginBottom: 4, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          value={place}
                          checked={selectedPlaces.includes(place)}
                          onChange={handlePlaceChange}
                          style={{ marginRight: 6 }}
                        />
                        {place}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
          onClick={() =>
            fetchProjectsUtil({
              search: searchTerm,
              setLoading,
              setError,
              setProjects,
              setSearchApplied,
              fetchProjectsApi,
            })
          }
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
