const { prisma } = require("../config/prisma.config");
const path = require("path");
const { exec } = require("child_process");
const generateDockerfile = require("../utils/docker_generator");
const ioManager = require("../sockets/io");
const dockerService = require("../services/docker.service");



exports.initiateDeployment = async ({ repoUrl, branch }) => {
    const [, , , owner, repoName] = repoUrl.split("/");
    const fullName = `${owner}/${repoName.replace(".git", "")}`;

    const repository = await prisma.repository.create({
      data: {
        githubRepoId: BigInt(0),
        name: repoName,
        fullName,
        cloneUrl: repoUrl,
        defaultBranch: branch,
        webhookId: BigInt(0),
      },
    });

    const deployment = await prisma.deployment.create({
      data: {
        repositoryId: repository.id,
        branch,
        commitSha: "UNKNOWN",
        status: "PENDING",
      },
    });

    return deployment;
}



exports.processDeployment = async (deployment) => {
  const workDir = path.join("/tmp", deployment.id);
  const repoUrl = deployment.repository.cloneUrl;
  const branch = deployment.branch;
  const repoName = deployment.repository.name;

  try {
    await run(`git clone -b ${branch} ${repoUrl} ${workDir}`);
    const commitSha = (await run("git rev-parse HEAD", workDir)).trim();
    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);

    await generateDockerfile(workDir);

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });

    await dockerService.buildImage({
          imageTag,
          contextDir: workDir,
          onLog: (log) => {
            ioManager.get().to(`build-${deployment.id}`).emit("build-logs", log);
          },
    });

    const port = 3000 + Math.floor(Math.random() * 1000);
    const containerId = await run(
      `docker run -d -p ${port}:3000 ${imageTag}`
    );

    // Create container linked to deployment
    await prisma.container.create({
      data: {
        dockerContainerId: containerId.trim(),
        port: port,
        status: "RUNNING",
        startedAt: new Date(),
        deploymentId: deployment.id,
      },
    });

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: "RUNNING",
        imageTag,
        containerId: containerId.trim(),
        exposedPort: port,
      },
    });
  } catch (err) {
    console.error("Deployment failed:", err);
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "FAILED" },
    });
    
    ioManager.get().to(`build-${deployment.id}`).emit("build-logs", `\nDeployment Failed: ${err.message}\n`);
  }
};

exports.deleteDeployment = async (deploymentId) => {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { container: true },
  });

  if (!deployment) throw new Error("Deployment not found");

  if (deployment.container && deployment.container.dockerContainerId) {
    try {
        await run(`docker rm -f ${deployment.container.dockerContainerId}`);
    } catch (e) {
        console.warn("Failed to remove docker container:", e.message);
    }
  }

  // Database deletion (cascades to container)
  return prisma.deployment.delete({
    where: { id: deploymentId },
  });
};

exports.startDeployment = async (deploymentId) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true }
    });
    
    if (!deployment || !deployment.container) throw new Error("Deployment or container not found");

    if (deployment.status === 'RUNNING') return deployment;

    await run(`docker start ${deployment.container.dockerContainerId}`);

    // Update both
    await prisma.container.update({
        where: { id: deployment.container.id },
        data: { status: 'RUNNING', startedAt: new Date(), stoppedAt: null }
    });

    return prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'RUNNING' },
        include: { container: true }
    });
};

exports.stopDeployment = async (deploymentId) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true }
    });

    if (!deployment || !deployment.container) throw new Error("Deployment or container not found");

    if (deployment.status === 'STOPPED') return deployment;

    await run(`docker stop ${deployment.container.dockerContainerId}`);

    // Update both
    await prisma.container.update({
        where: { id: deployment.container.id },
        data: { status: 'STOPPED', stoppedAt: new Date() }
    });

    return prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'STOPPED' },
        include: { container: true }
    });
};


function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}
