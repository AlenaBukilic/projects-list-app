import axios from "axios";
import qs from "qs";

const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 5000,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
});

export function fetchProjects(params) {
  return api.get("/api/projects", { params });
}

export function createProject(data) {
  return api.post("/api/project", data);
}

export function fetchProjectStatuses() {
  return api.get("/api/project-statuses");
}

export function fetchProjectPlaces() {
  return api.get("/api/project-places");
} 