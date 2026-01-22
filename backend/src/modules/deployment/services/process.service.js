const { prisma } = require("../../../shared/config/prisma.config");
const path = require("path");
const generateDockerfile = require("../../../shared/utils/docker_generator");
const ioManager = require("../../../shared/infrastructure/sockets/io");
const buildType = require("../../../shared/utils/detectBuilds");
const dockerService = require("../../../shared/infrastructure/docker/docker.service");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getBuildLogStream } = require("../../../shared/utils/logWriter");
const { run } = require("./utils");

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

exports.processDeployment = async (deployment) => {
  const buildId = uuidv4();
  const workDir = path.join("/tmp", `build-${buildId}`);

  const repoUrl = deployment.repository.cloneUrl;
  const branch = deployment.branch;
  const repoName = deployment.repository.name;  
  let buildSpec = JSON.parse(deployment.buildSpec);
  try {    await run(`git clone -b ${branch} ${repoUrl} ${workDir}`);    
    // If commitSha is already set (for rollback), checkout that specific commit    let commitSha = deployment.commitSha;
    if (commitSha && commitSha !== "UNKNOWN") {
      console.log(`[PROCESS] Checking out specific commit (rollback): ${commitSha}`);
      await run(`git checkout ${commitSha}`, workDir);    } else {
      // Get current HEAD commit
      commitSha = (await run("git rev-parse HEAD", workDir)).trim();    }
    
    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);
    if (buildSpec.language === 'detect' || !buildSpec.runtimeImage) {        const detectedType = await buildType.detectBuildType(workDir);        
        if (detectedType && DEFAULTS[detectedType]) {            const defaults = DEFAULTS[detectedType];
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
    }    await generateDockerfile(workDir, buildSpec);    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });    const buildLogStream = getBuildLogStream(deployment.id);
    await dockerService.buildImage({
          imageTag,
          contextDir: workDir,
          logStream: buildLogStream,
          onLog: (log) => {
            ioManager.get().to(`build-${deployment.id}`).emit("build-logs", log);
          },
    });    const containerId = await run(
      `docker run -d -p ${deployment.exposedPort}:${3000} ${imageTag}`
    );
    console.log(`[PROCESS] ✓ Container started: ${containerId.trim()}`);    await prisma.container.create({
      data: {
        dockerContainerId: containerId.trim(),
        port: deployment.exposedPort,
        status: "RUNNING",
        startedAt: new Date(),
        deploymentId: deployment.id,
      },
    });    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: "RUNNING",
        imageTag,
        containerId: containerId.trim(),
        container: undefined, 
      },
    });    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
        deploymentId: deployment.id,
        status: "RUNNING"
    });    console.log(`[PROCESS] Container: ${containerId.trim()}`);
  } catch (err) {    await prisma.deployment.update({
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
      } catch (cleanupErr) {      }
  }
};

