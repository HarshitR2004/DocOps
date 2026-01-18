const { prisma } = require("../config/prisma.config");
const path = require("path");
const { exec } = require("child_process");
const generateDockerfile = require("../utils/docker_generator");
const { connect } = require("http2");

exports.deployFromPublicRepo = async ({ repoUrl, branch }) => {
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

  const workDir = path.join("/tmp", deployment.id);

  try {
    await run(`git clone -b ${branch} ${repoUrl} ${workDir}`);
    const commitSha = (await run("git rev-parse HEAD", workDir)).trim();
    const imageTag = repoName.toLowerCase() + commitSha.substring(0, 7);

    await generateDockerfile(workDir);

    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "BUILDING", commitSha: commitSha },
    });

    await run(`docker build -t ${imageTag} .`, workDir);

    const port = 3000 + Math.floor(Math.random() * 1000);
    const containerId = await run(
      `docker run -d -p ${port}:3000 ${imageTag}`
    );

    await prisma.container.create({
      data: {
        dockerContainerId: containerId.trim(),
        port: port,
        status: "RUNNING",
        startedAt: new Date(),
        deployment: {
          connect: {
            id: deployment.id,
          }
        },
      },
    });

    return await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: "RUNNING",
        imageTag,
        containerId: containerId.trim(),
        exposedPort: port,
      },
    });
  } catch (err) {
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "FAILED" },
    });

    throw err;
  }
};


function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}
