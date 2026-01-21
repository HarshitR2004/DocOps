

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
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        throw error;
    }
}

