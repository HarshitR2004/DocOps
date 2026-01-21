const githubService = require("./github.service");

exports.getGithubRepos = async (req, res) => {
    try {
        const accessToken = req.user.githubAccessToken;
        const repos = await githubService.fetchGithubRepos(accessToken);
        res.json(repos);
    } catch (error) {
        console.error("Error fetching GitHub repos:", error);
        res.status(500).json({ error: "Failed to fetch GitHub repos" });
    }
}

