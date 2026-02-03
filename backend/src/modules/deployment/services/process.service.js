const { prisma } = require("../../../shared/config/prisma.config");
const path = require("path");
const generateDockerfile = require("../../../shared/utils/docker_generator");
const ioManager = require("../../../shared/infrastructure/sockets/io");

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

  try {
    const cachePath = await ensureRepoCache(repoUrl);

    await run(`git clone -b ${branch} ${cachePath} ${workDir}`);

    // 3. Determine Commit SHA
    let commitSha = deployment.commitSha;
    if (commitSha && commitSha !== "UNKNOWN") {
      await run(`git checkout ${commitSha}`, workDir);
    } else {
      commitSha = (await run("git rev-parse HEAD", workDir)).trim();
    }

    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);


    // 4. Ensure Build Spec (Apply defaults based on language)
    buildSpec = await ensureBuildSpec(deployment, buildSpec);

    await generateDockerfile(workDir, buildSpec);

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });

    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
      deploymentId: deployment.id,
      status: "BUILDING"
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

    await prisma.$transaction([
      prisma.container.create({
        data: {
          dockerContainerId: containerId.trim(),
          port: deployment.exposedPort,
          status: "RUNNING",
          startedAt: new Date(),
          deploymentId: deployment.id,
        },
      }),
      prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: "RUNNING",
          imageTag,
          containerId: containerId.trim(),
          container: undefined,
        },
      })
    ]);

    ioManager.get().to(`deployment-${deployment.id}`).emit("deployment-status", {
      deploymentId: deployment.id,
      status: "RUNNING"
    });

  } catch (err) {
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
        
    }
  }
};


 //Ensures the repository is cached locally.
async function ensureRepoCache(repoUrl) {
    const os = require('os');
    const CACHE_ROOT = path.join(os.tmpdir(), 'docops-cache');
    
    // Create cache root if it doesn't exist
    if (!fs.existsSync(CACHE_ROOT)) {
        await fs.promises.mkdir(CACHE_ROOT, { recursive: true });
    }

    // Generate a safe folder name from the URL
    const sanitize = (url) => {
        return url.replace(/^https?:\/\//, '').replace(/.git$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
    };
    
    const repoFolderName = sanitize(repoUrl);
    const repoCachePath = path.join(CACHE_ROOT, repoFolderName);

    if (fs.existsSync(repoCachePath)) {
        console.log(`[Cache] Updating existing cache for ${repoUrl}...`);
        try {
            // Fetch updates
            await run(`git fetch origin`, repoCachePath);
        } catch (err) {
            console.warn(`[Cache] Failed to fetch updates for ${repoUrl}, trying to re-clone. Error: ${err.message}`);
            // If fetch fails (e.g., corrupted repo), remove and re-clone
            await fs.promises.rm(repoCachePath, { recursive: true, force: true });
            await run(`git clone ${repoUrl} ${repoCachePath}`);
        }
    } else {
        console.log(`[Cache] Clonining new repo to cache: ${repoUrl}...`);
        await run(`git clone ${repoUrl} ${repoCachePath}`);
    }

    return repoCachePath;
}


// Helper to apply default build specification based on language
async function ensureBuildSpec(deployment, currentBuildSpec) {
    if (currentBuildSpec.language === 'detect') {
         await prisma.deployment.update({
            where: { id: deployment.id },
            data: { status: "FAILED" },
        });
        throw new Error("Auto-detection is no longer supported. Please specify a language.");
    }

    const defaults = DEFAULTS[currentBuildSpec.language];
    
    // If no defaults found for the language and no runtime image provided, fail
    if (!defaults && !currentBuildSpec.runtimeImage) {
         await prisma.deployment.update({
            where: { id: deployment.id },
            data: { status: "FAILED" },
        });
        throw new Error(`Unsupported language '${currentBuildSpec.language}' and no runtime image provided.`);
    }

    // Apply defaults if available
    const newBuildSpec = {
        ...currentBuildSpec,
        runtimeImage: currentBuildSpec.runtimeImage || (defaults && defaults.runtimeImage),
        buildCommand: currentBuildSpec.buildCommand || (defaults && defaults.buildCommand),
        startCommand: currentBuildSpec.startCommand || (defaults && defaults.startCommand),
    };

    await prisma.deployment.update({
        where: { id: deployment.id },
        data: { buildSpec: JSON.stringify(newBuildSpec) }
    });

    return newBuildSpec;
}
