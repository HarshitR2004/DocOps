const { prisma } = require("../../config/prisma.config");
const path = require("path");
const { exec } = require("child_process");
const generateDockerfile = require("../../utils/docker_generator");
const ioManager = require("../../sockets/io");
const buildType = require("../../utils/detectBuilds");
const dockerService = require("./docker.service");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const {
  getBuildLogStream,
  getRuntimeLogStream,
} = require("../../utils/logWriter");


const DEFAULTS = {
    node: {
        runtimeImage: 'node:18',
        buildCommand: 'npm install',
        startCommand: 'npm start'
    },
    python: {
        runtimeImage: 'python:3.9',
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'python app.py'
    }
};

exports.initiateDeployment = async ({ repoUrl, branch, buildSpec }) => {
    const [, , , owner, repoName] = repoUrl.split("/");
    const fullName = `${owner}/${repoName.replace(".git", "")}`;

    if (!buildSpec || !buildSpec.exposedPort) {
        throw new Error("Invalid buildSpec: exposedPort is required");
    }

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
        buildSpec: JSON.stringify(buildSpec),
        exposedPort: buildSpec.exposedPort,
        commitSha: "UNKNOWN",
        status: "PENDING",
      },
    });

    return deployment;
}


exports.processDeployment = async (deployment) => {
  const buildId = uuidv4();
  const workDir = path.join("/tmp", `build-${buildId}`);

  const repoUrl = deployment.repository.cloneUrl;
  const branch = deployment.branch;
  const repoName = deployment.repository.name;
  
  let buildSpec = JSON.parse(deployment.buildSpec);

  try {
    await run(`git clone -b ${branch} ${repoUrl} ${workDir}`);
    
    const commitSha = (await run("git rev-parse HEAD", workDir)).trim();
    
    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);

    if (buildSpec.language === 'detect' || !buildSpec.runtimeImage) {
        const detectedType = await buildType.detectBuildType(workDir);
        
        if (detectedType && DEFAULTS[detectedType]) {
            const defaults = DEFAULTS[detectedType];
            buildSpec = {
                ...buildSpec,
                language: detectedType,
                runtimeImage: buildSpec.runtimeImage || defaults.runtimeImage,
                buildCommand: buildSpec.buildCommand || defaults.buildCommand,
                startCommand: buildSpec.startCommand || defaults.startCommand,
            };
            
            await prisma.deployment.update({
                where: { id: deployment.id },
                data: { buildSpec: JSON.stringify(buildSpec) }
            });
        } else {
            await prisma.deployment.update({
                where: { id: deployment.id },
                data: { status: "FAILED" },
            });

            throw new Error("Could not auto-detect project type");
            
        }
    }

    await generateDockerfile(workDir, buildSpec);

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });

    const buildLogStream = getBuildLogStream(deployment.id);
    await dockerService.buildImage({
          imageTag,
          contextDir: workDir,
          logStream: buildLogStream,
          onLog: (log) => {
            ioManager.get().to(`build-${deployment.id}`).emit("build-logs", log);
          },
    });

    const containerId = await run(
      `docker run -d -p ${deployment.exposedPort}:${3000} ${imageTag}`
    );

    await prisma.container.create({
      data: {
        dockerContainerId: containerId.trim(),
        port: deployment.exposedPort,
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
        container: undefined, 
      },
    });

    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
        deploymentId: deployment.id,
        status: "RUNNING"
    });

  } catch (err) {
    console.error("Deployment failed:", err);
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "FAILED" },
    });
    
    ioManager.get().to(`build-${deployment.id}`).emit("build-logs", `\nDeployment Failed: ${err.message}\n`);
    
    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
        deploymentId: deployment.id,
        status: "FAILED"
    });
  } finally {
      // Cleanup the ephemeral build directory
      try {
          if (fs.existsSync(workDir)) {
              await fs.promises.rm(workDir, { recursive: true, force: true });
          }
      } catch (cleanupErr) {
          console.warn(`Failed to cleanup build directory ${workDir}:`, cleanupErr.message);
      }
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



  try {
      let baseDir = process.env.BASE_LOG_DIR || "";
      baseDir = baseDir.replace(/^"|"$/g, '');
      const logDir = path.join(baseDir, deploymentId);
      if (fs.existsSync(logDir)) {
          await fs.promises.rm(logDir, { recursive: true, force: true });
      }
  } catch (e) {
      console.warn("Failed to delete deployment logs:", e.message);
  }

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

exports.getDeploymentConfig = async (deploymentId) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true, repository: true }
    });

    if (!deployment) throw new Error("Deployment not found");

    return {
        ...deployment,
        buildSpec: JSON.parse(deployment.buildSpec)
    };
};




exports.redeployDeployment = async (deploymentId, newBuildSpec) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true, repository: true }
    });

    if (!deployment) throw new Error("Deployment not found");

    if (deployment.container && deployment.container.dockerContainerId) {
        try {
           await run(`docker rm -f ${deployment.container.dockerContainerId}`);
        } catch (e) {
           console.warn("Failed to remove old container:", e.message);
        }
    }

    const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
            buildSpec: newBuildSpec ? JSON.stringify(newBuildSpec) : deployment.buildSpec,
            exposedPort: newBuildSpec?.exposedPort ? newBuildSpec.exposedPort: deployment.exposedPort,
            status: "PENDING",
            container: {
                delete: deployment.container ? true : undefined
            }
        },
        include: { repository: true }
    });

    this.processDeployment(updatedDeployment);

    return updatedDeployment;
};



function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}
