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
        console.error("Error fetching GitHub repos:", error);
        res.status(500).json({ error: "Failed to fetch GitHub repos" });
    }
}


exports.handleGithubWebhook = async (req, res) => {
  console.log("\n========== WEBHOOK RECEIVED ==========");
  console.log("[WEBHOOK] Verifying signature...");
  
  // Skip signature verification if webhook secret is not configured
  if (process.env.GITHUB_WEBHOOK_SECRET) {
    if (!verifySignature(req)) {
      console.log("[WEBHOOK] ❌ Signature verification failed");
      return res.status(401).send("Invalid signature");
    }
    console.log("[WEBHOOK] ✓ Signature verified");
  } else {
    console.log("[WEBHOOK] ⚠ Signature verification skipped (GITHUB_WEBHOOK_SECRET not configured)");
  }

  const event = req.headers["x-github-event"];
  console.log(`[WEBHOOK] Event type: ${event}`);
  
  if (event !== "push") {
    console.log("[WEBHOOK] Event ignored (not a push event)");
    return res.status(200).send("Ignored");
  }

  const payload = req.body;
  const repoId = payload.repository.id;
  const branch = payload.ref.replace("refs/heads/", "");
  const commitSha = payload.after;
  const commitMessage = payload.head_commit?.message;
  
  console.log(`[WEBHOOK] Repository ID: ${repoId}`);
  console.log(`[WEBHOOK] Branch: ${branch}`);
  console.log(`[WEBHOOK] Commit SHA: ${commitSha}`);
  console.log(`[WEBHOOK] Commit Message: ${commitMessage}`);

  console.log(`[WEBHOOK] Looking up repository in database...`);
  const repository  = await prisma.githubRepo.findUnique({
    where: { id: BigInt(repoId) },
  });

  if (!repository) {
    console.log(`[WEBHOOK] ❌ Repository not found in database`);
    return res.status(404).send("Repository not found");
  }
  console.log(`[WEBHOOK] ✓ Repository found: ${repository.name}`);

  console.log(`[WEBHOOK] Searching for active deployments on branch '${branch}'...`);
  const activeDeployments = await prisma.deployment.findMany({
    where: {
      repositoryId: repository.id,
      status: "RUNNING",
      branch: branch
    },
  });
  console.log(`[WEBHOOK] Found ${activeDeployments.length} active deployment(s)`);

  if (activeDeployments.length === 0){
    console.log("[WEBHOOK] No active deployments to update");
    return res.status(200).send("No active deployments exist")
  }

  console.log(`[WEBHOOK] Queuing redeployments...`);
  const queuedDeployments = [];
  const failedDeployments = [];

  for (const parent of activeDeployments) {
    console.log(`[WEBHOOK] → Queuing deployment ${parent.id}`);
    try {
      await deployQueue.add(async () => {
        try {
          await redeployFromParent(parent.id, branch);
          queuedDeployments.push(parent.id);
        } catch (error) {
          console.error(`Failed to redeploy ${parent.id}:`, error);
          failedDeployments.push({ id: parent.id, error: error.message });
          
          await prisma.deployment.update({
            where: { id: parent.id },
            data: { status: "FAILED" }
          });
        }
      });
    } catch (queueError) {
      console.error(`Failed to queue deployment ${parent.id}:`, queueError);
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

