const deployService = require("../services/deploy.service");
const { prisma } = require("../config/prisma.config");

exports.deployPublicRepo = async (req, res) => {
  const { repoUrl, branch = "main" } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  const deployment = await deployService.deployFromPublicRepo({
    repoUrl,
    branch,
  });

  res.status(202).json({
    message: "Deployment started",
    deploymentId: deployment.id,
  });
};

exports.getDeploymentById = async (req, res) => {
  const deployment = await prisma.deployment.findUnique({
    where: { id: req.params.id },
    include: {
      repository: true,
    },
  });

  if (!deployment) {
    return res.status(404).json({ error: "Deployment not found" });
  }

  res.json(deployment);
};

exports.listDeployments = async (req, res) => {
  const deployments = await prisma.deployment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      repository: true,
    },
  });

  res.json(deployments);
};


exports.deleteDeployment = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Deployment id is required" });
  }

  await prisma.deployment.delete({
    where: { id },
  });

  return res.status(200).json({ message: "Deployment deleted" });
};