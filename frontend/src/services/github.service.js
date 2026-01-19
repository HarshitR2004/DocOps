import api from "./api";

const GithubService = {
  getRepos: async () => {
    try {
      const response = await api.get("/github/repos", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
       console.error("Error fetching GitHub repos:", error);
       throw error;
    }
  },
};

export default GithubService;
