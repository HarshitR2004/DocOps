const deployService = require("../services/deploy.service");
const { prisma } = require("../config/prisma.config");



exports.deployPublicRepo = async (req, res) => {
  const { repoUrl, branch = "main", buildSpec } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }



  try {
      const deployment = await deployService.initiateDeployment({
        repoUrl,
        branch,
        buildSpec,
      });

      res.status(202).json({
        message: "Deployment initiated",
        deploymentId: deployment.id,
      });
      
      const fullDeployment = await prisma.deployment.findUnique({
          where: { id: deployment.id },
          include: { repository: true }
      });

      if (fullDeployment) {
         deployService.processDeployment(fullDeployment);
      }

  } catch(e) {
      if (!res.headersSent) {
        res.status(500).json({ error: e.message });
      } else {
        console.error("Error after response sent:", e);
      }
  }
};

exports.getDeploymentById = async (req, res) => {
  const deployment = await prisma.deployment.findUnique({
    where: { id: req.params.id },
    include: {
      repository: true,
      container: true,
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
      container: true,
    },
  });

  res.json(deployments);
};

exports.deleteDeployment = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Deployment id is required" });
  }

  try {
      await deployService.deleteDeployment(id);
      return res.status(200).json({ message: "Deployment deleted" });
  } catch (err) {
      return res.status(500).json({ error: err.message });
  }
};

exports.startDeployment = async (req, res) => {
    const { id } = req.params;
    try {
        const deployment = await deployService.startDeployment(id);
        res.json({ message: "Deployment started", deployment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.stopDeployment = async (req, res) => {
    const { id } = req.params;
    try {
        const deployment = await deployService.stopDeployment(id);
        res.json({ message: "Deployment stopped", deployment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.redeployDeployment = async (req, res) => {
    const { id } = req.params;
    const { buildSpec } = req.body;

    try {
        const deployment = await deployService.redeployDeployment(id, buildSpec);
        res.json({ message: "Redeployment initiated", deployment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getDeploymentConfig = async (req, res) => {
    const { id } = req.params;
    try {
        const deploymentConfig = await deployService.getDeploymentConfig(id);
        res.json({ deploymentConfig });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};