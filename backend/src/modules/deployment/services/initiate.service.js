const { prisma } = require("../../../shared/config/prisma.config");

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
