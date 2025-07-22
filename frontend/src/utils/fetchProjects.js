export default async function fetchProjects({
  search = "",
  status = [],
  place = [],
  user = [],
  setLoading,
  setError,
  setProjects,
  setSearchApplied,
  fetchProjectsApi,
}) {
  try {
    setLoading(true);
    setError(null);
    const params = {};
    if (search.trim()) {
      params.search = search.trim();
    }
    if (Array.isArray(status) && status.length > 0) {
      params.status = status;
    }
    if (Array.isArray(place) && place.length > 0) {
      params.place = place;
    }
    if (Array.isArray(user) && user.length > 0) {
      params.user = user;
    }
    const response = await fetchProjectsApi(params);
    setProjects(response.data.data || []);
    setSearchApplied(response.data.searchApplied || false);
  } catch (err) {
    setError(err.response?.data?.error || "Failed to fetch projects");
    console.error("Error fetching projects:", err);
  } finally {
    setLoading(false);
  }
}
