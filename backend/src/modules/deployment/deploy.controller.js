const deployService = require("./deploy.service");
const { prisma } = require("../.././shared/config/prisma.config");
const { 
  publishDeploymentJob, 
  publishContainerJob 
} = require("../../shared/infrastructure/rabbitmq/producer");
const { JOB_TYPES } = require("../../shared/infrastructure/rabbitmq/queues.config");
const { v4: uuidv4 } = require("uuid");


exports.deployPublicRepo = async (req, res) => {
  const { repoUrl, branch = "main", buildSpec } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  try {
    // Create deployment record
    const deployment = await deployService.initiateDeployment({
      repoUrl,
      branch,
      buildSpec,
    });

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishDeploymentJob({
      type: JOB_TYPES.DEPLOYMENT.CREATE,
      jobId,
      deploymentId: deployment.id,
      repoUrl,
      branch,
      buildSpec,
    });

    // Return immediately with 202 Accepted
    res.status(202).json({
      message: "Deployment queued for processing",
      deploymentId: deployment.id,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing deployment:", error);
    res.status(500).json({ error: error.message });
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
    // Verify deployment exists
    const deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishContainerJob({
      type: JOB_TYPES.CONTAINER_OPERATIONS.DELETE,
      jobId,
      deploymentId: id,
    });

    res.status(202).json({ 
      message: "Delete operation queued", 
      deploymentId: id,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing delete operation:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.startDeployment = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verify deployment exists
    const deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishContainerJob({
      type: JOB_TYPES.CONTAINER_OPERATIONS.START,
      jobId,
      deploymentId: id,
    });

    res.status(202).json({ 
      message: "Start operation queued", 
      deploymentId: id,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing start operation:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.stopDeployment = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verify deployment exists
    const deployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishContainerJob({
      type: JOB_TYPES.CONTAINER_OPERATIONS.STOP,
      jobId,
      deploymentId: id,
    });

    res.status(202).json({ 
      message: "Stop operation queued", 
      deploymentId: id,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing stop operation:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.redeployDeployment = async (req, res) => {
  const { id } = req.params;
  const { buildSpec } = req.body;

  try {
    // Verify deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { id },
      include: { repository: true },
    });

    if (!existingDeployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Create new deployment record
    const newDeployment = await deployService.initiateDeployment({
      repoUrl: existingDeployment.repository.url,
      branch: existingDeployment.repository.branch,
      buildSpec: buildSpec || existingDeployment.buildSpec,
      parentDeploymentId: id,
    });

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishDeploymentJob({
      type: JOB_TYPES.DEPLOYMENT.REDEPLOY,
      jobId,
      deploymentId: newDeployment.id,
      parentDeploymentId: id,
      repoUrl: existingDeployment.repository.url,
      branch: existingDeployment.repository.branch,
      buildSpec: buildSpec || existingDeployment.buildSpec,
    });

    res.status(202).json({ 
      message: "Redeployment queued", 
      deploymentId: newDeployment.id,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing redeployment:", error);
    res.status(500).json({ error: error.message });
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

exports.getDeploymentHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const history = await deployService.getDeploymentHistory(id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rollbackDeployment = async (req, res) => {
  const { id } = req.params;
  const { targetCommitSha } = req.body;

  if (!targetCommitSha) {
    return res.status(400).json({ error: "targetCommitSha is required" });
  }

  try {
    // Verify deployment exists
    const existingDeployment = await prisma.deployment.findUnique({
      where: { id },
      include: { repository: true },
    });

    if (!existingDeployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Create new deployment record for rollback
    const newDeployment = await deployService.initiateDeployment({
      repoUrl: existingDeployment.repository.url,
      branch: existingDeployment.repository.branch,
      commitSha: targetCommitSha,
      buildSpec: existingDeployment.buildSpec,
      parentDeploymentId: id,
    });

    // Publish job to RabbitMQ
    const jobId = uuidv4();
    await publishDeploymentJob({
      type: JOB_TYPES.DEPLOYMENT.ROLLBACK,
      jobId,
      deploymentId: newDeployment.id,
      parentDeploymentId: id,
      repoUrl: existingDeployment.repository.url,
      branch: existingDeployment.repository.branch,
      commitSha: targetCommitSha,
      buildSpec: existingDeployment.buildSpec,
    });

    res.status(202).json({ 
      message: "Rollback queued", 
      deploymentId: newDeployment.id,
      targetCommitSha,
      jobId,
    });
  } catch (error) {
    console.error("[Controller] Error queuing rollback:", error);
    res.status(500).json({ error: error.message });
  }
};


