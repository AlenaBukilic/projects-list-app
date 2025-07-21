export default async function fetchProjects({
  search = "",
  setLoading,
  setError,
  setProjects,
  setSearchApplied,
  fetchProjectsApi
}) {
  try {
    setLoading(true);
    setError(null);
    const params = {};
    if (search.trim()) {
      params.search = search.trim();
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