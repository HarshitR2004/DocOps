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
  
  console.log(`\n[PROCESS] ========== PROCESSING DEPLOYMENT ==========`);
  console.log(`[PROCESS] Deployment ID: ${deployment.id}`);
  console.log(`[PROCESS] Repository: ${repoName}`);
  console.log(`[PROCESS] Branch: ${branch}`);
  console.log(`[PROCESS] Build ID: ${buildId}`);
  console.log(`[PROCESS] Work directory: ${workDir}`);
  
  let buildSpec = JSON.parse(deployment.buildSpec);
  console.log(`[PROCESS] Build spec:`, buildSpec);

  try {
    console.log(`[PROCESS] Step 1: Cloning repository...`);
    await run(`git clone -b ${branch} ${repoUrl} ${workDir}`);
    console.log(`[PROCESS] ✓ Repository cloned`);
    
    // If commitSha is already set (for rollback), checkout that specific commit
    console.log(`[PROCESS] Step 2: Resolving commit SHA...`);
    let commitSha = deployment.commitSha;
    if (commitSha && commitSha !== "UNKNOWN") {
      console.log(`[PROCESS] Checking out specific commit (rollback): ${commitSha}`);
      await run(`git checkout ${commitSha}`, workDir);
      console.log(`[PROCESS] ✓ Checked out commit: ${commitSha}`);
    } else {
      // Get current HEAD commit
      commitSha = (await run("git rev-parse HEAD", workDir)).trim();
      console.log(`[PROCESS] ✓ Using HEAD commit: ${commitSha}`);
    }
    
    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);
    console.log(`[PROCESS] Docker image tag: ${imageTag}`);

    if (buildSpec.language === 'detect' || !buildSpec.runtimeImage) {
        console.log(`[PROCESS] Step 3: Auto-detecting build type...`);
        const detectedType = await buildType.detectBuildType(workDir);
        console.log(`[PROCESS] Detected type: ${detectedType || 'none'}`);
        
        if (detectedType && DEFAULTS[detectedType]) {
            console.log(`[PROCESS] ✓ Applying defaults for ${detectedType}`);
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

    console.log(`[PROCESS] Step 4: Generating Dockerfile...`);
    await generateDockerfile(workDir, buildSpec);
    console.log(`[PROCESS] ✓ Dockerfile generated`);

    console.log(`[PROCESS] Step 5: Updating deployment status to BUILDING...`);
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });
    console.log(`[PROCESS] ✓ Status updated`);

    console.log(`[PROCESS] Step 6: Building Docker image...`);
    const buildLogStream = getBuildLogStream(deployment.id);
    await dockerService.buildImage({
          imageTag,
          contextDir: workDir,
          logStream: buildLogStream,
          onLog: (log) => {
            ioManager.get().to(`build-${deployment.id}`).emit("build-logs", log);
          },
    });
    console.log(`[PROCESS] ✓ Docker image built successfully`);

    console.log(`[PROCESS] Step 7: Starting Docker container...`);
    console.log(`[PROCESS] Port mapping: ${deployment.exposedPort}:3000`);
    const containerId = await run(
      `docker run -d -p ${deployment.exposedPort}:${3000} ${imageTag}`
    );
    console.log(`[PROCESS] ✓ Container started: ${containerId.trim()}`);

    console.log(`[PROCESS] Step 8: Creating container record in database...`);
    await prisma.container.create({
      data: {
        dockerContainerId: containerId.trim(),
        port: deployment.exposedPort,
        status: "RUNNING",
        startedAt: new Date(),
        deploymentId: deployment.id,
      },
    });
    console.log(`[PROCESS] ✓ Container record created`);

    console.log(`[PROCESS] Step 9: Updating deployment status to RUNNING...`);
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: "RUNNING",
        imageTag,
        containerId: containerId.trim(),
        container: undefined, 
      },
    });

    console.log(`[PROCESS] ✓ Deployment status updated`);

    console.log(`[PROCESS] Step 10: Emitting deployment status via WebSocket...`);
    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
        deploymentId: deployment.id,
        status: "RUNNING"
    });
    
    console.log(`[PROCESS] ========== DEPLOYMENT SUCCESSFUL ==========`);
    console.log(`[PROCESS] Deployment ID: ${deployment.id}`);
    console.log(`[PROCESS] Image: ${imageTag}`);
    console.log(`[PROCESS] Container: ${containerId.trim()}`);
    console.log(`[PROCESS] Port: ${deployment.exposedPort}`);
    console.log(`[PROCESS] ============================================\n`);

  } catch (err) {
    console.error(`\n[PROCESS] ❌ ========== DEPLOYMENT FAILED ==========`);
    console.error(`[PROCESS] Deployment ID: ${deployment.id}`);
    console.error(`[PROCESS] Error:`, err.message);
    console.error(`[PROCESS] Stack:`, err.stack);
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
