const githubService = require("./github.service");
const {redeployFromParent} = require("../deployment/services/redeploy.service");
const { prisma } = require("../../shared/config/prisma.config");
const { verifySignature } = require("./verifySignature");
const deployQueue = require("../deployment/deploy.queue");

exports.getGithubRepos = async (req, res) => {
    try {
        const accessToken = req.user.githubAccessToken;
        const repos = await githubService.fetchGithubRepos(accessToken);
        res.json(repos);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch GitHub repos" });
    }
}


exports.handleGithubWebhook = async (req, res) => {
  if (process.env.GITHUB_WEBHOOK_SECRET) {
    if (!verifySignature(req)) {
      return res.status(401).send("Invalid signature");
    }
  }

  const event = req.headers["x-github-event"];
  
  if (event !== "push") {
    return res.status(200).send("Ignored");
  }

  const payload = req.body;
  const repoId = payload.repository.id;
  const branch = payload.ref.replace("refs/heads/", "");
  const commitSha = payload.after;

  const repository  = await prisma.repository.findUnique({
    where: { githubRepoId: BigInt(repoId) },
  });

  if (!repository) {
    return res.status(404).send("Repository not found");
  }

  const activeDeployments = await prisma.deployment.findMany({
    where: {
      repositoryId: repository.id,
      status: "RUNNING",
      branch: branch
    },
  });

  if (activeDeployments.length === 0){
    return res.status(200).send("No active deployments exist")
  }

  const queuedDeployments = [];
  const failedDeployments = [];

  for (const parent of activeDeployments) {
    try {
      await deployQueue.add(async () => {
        try {
          await redeployFromParent(parent.id, branch);
          queuedDeployments.push(parent.id);
        } catch (error) {
          failedDeployments.push({ id: parent.id, error: error.message });
          
          await prisma.deployment.update({
            where: { id: parent.id },
            data: { status: "FAILED" }
          });
        }
      });
    } catch (queueError) {
      failedDeployments.push({ id: parent.id, error: queueError.message });
    }
  }

  res.status(200).json({
    message: `Queued ${queuedDeployments.length} deployments`,
    queued: queuedDeployments.length,
    failed: failedDeployments.length,
    failedDeployments
  });

  
};

