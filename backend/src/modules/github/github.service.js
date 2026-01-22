exports.fetchGithubRepos = async (accessToken) => {
    try {
        const response = await fetch("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer  ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {        throw error;
    }
}


exports.getGitHubRepoData = async (repoUrl) => {
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/;
  const match = repoUrl.trim().match(urlPattern);

  if (!match) {
    throw new Error(
      `Invalid GitHub repository URL. Expected format: https://github.com/owner/repo or https://github.com/owner/repo.git`
    );
  }

  const [, owner, repo] = match;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        "User-Agent": "DocOps",
        "Accept": "application/vnd.github+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repo info (${response.status})`
    );
  }

  const data = await response.json();

  return data; 
};




