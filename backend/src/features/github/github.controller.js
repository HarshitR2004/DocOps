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

exports.handleGithubWebhook = async (req, res) => {
    try {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        const payload = req.body;
        if (!verifyGithubSignature(signature, secret, payload)) {
            return res.status(401).send("Invalid signature");
        }

        const event = req.headers["x-github-event"]

        if (event == "push") {
            return res.status(200).json({ message: "Push event received successfully" });
        }

    } catch (error) {
        console.error("Error handling GitHub webhook:", error);
        res.status(500).json({ error: "Failed to handle GitHub webhook" });
    }
}


