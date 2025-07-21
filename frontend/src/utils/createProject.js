export default async function createProjectUtil({
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
}) {
  e.preventDefault();
  setCreating(true);
  setCreateError(null);
  try {
    await createProjectApi(createForm);
    setShowCreateForm(false);
    setCreateForm({
      name: "",
      status: "",
      applicant: "",
      place: "",
      user: "",
    });
    fetchProjectsUtil({
      search: searchTerm,
      setLoading,
      setError,
      setProjects,
      setSearchApplied,
      fetchProjectsApi,
    });
  } catch (err) {
    setCreateError(err.response?.data?.error || "Failed to create project");
  } finally {
    setCreating(false);
  }
} 