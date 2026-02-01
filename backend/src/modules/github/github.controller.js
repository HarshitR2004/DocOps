const githubService = require("./github.service");
const { redeployFromParent } = require("../deployment/services/redeploy.service");
const { prisma } = require("../../shared/config/prisma.config");
const { verifySignature } = require("./verifySignature");
const { publishGitHubWebhookJob } = require("../../shared/infrastructure/rabbitmq/producer");
const { JOB_TYPES } = require("../../shared/infrastructure/rabbitmq/queues.config");
const { v4: uuidv4 } = require("uuid");

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

  const repository = await prisma.repository.findUnique({
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

  if (activeDeployments.length === 0) {
    return res.status(200).send("No active deployments exist");
  }

  // Publish jobs to RabbitMQ for each active deployment
  const queuedJobs = [];
  const failedJobs = [];

  for (const deployment of activeDeployments) {
    try {
      const jobId = uuidv4();
      await publishGitHubWebhookJob({
        type: JOB_TYPES.GITHUB_WEBHOOK.PUSH,
        jobId,
        parentDeploymentId: deployment.id,
        branch,
        commitSha,
        repositoryId: repository.id,
      });

      queuedJobs.push({ deploymentId: deployment.id, jobId });
    } catch (error) {
      console.error(`[GitHub Webhook] Failed to queue job for deployment ${deployment.id}:`, error);
      failedJobs.push({ deploymentId: deployment.id, error: error.message });
    }
  }

  res.status(200).json({
    message: `Queued ${queuedJobs.length} redeployments`,
    queued: queuedJobs.length,
    failed: failedJobs.length,
    queuedJobs,
    failedJobs,
  });
};

