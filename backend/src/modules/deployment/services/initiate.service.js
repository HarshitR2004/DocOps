const { prisma } = require("../../../shared/config/prisma.config");
const { getGitHubRepoData } = require("../../../modules/github/github.service")


async function resolveRepository(repoUrl) {
  const repoData = await getGitHubRepoData(repoUrl);

  return {
    githubRepoId: BigInt(repoData.id),
    name: repoData.name,
    fullName: repoData.full_name,
    cloneUrl: repoData.clone_url,
    defaultBranch: repoData.default_branch,
  };
}

exports.initiateDeployment = async ({ repoUrl, buildSpec }) => {
    if (!buildSpec || !buildSpec.exposedPort) {
        throw new Error("Invalid buildSpec: exposedPort is required");
    }

    const existingDeployment = await prisma.deployment.findFirst({
        where: {
            status : 'RUNNING',
            exposedPort:  buildSpec.exposedPort
        }
    })

    if (existingDeployment) {
        throw new Error("Deployment already running on this port");
    }

    const repoMeta = await resolveRepository(repoUrl);

  const [repository, deployment] = await prisma.$transaction(async (tx) => {
  const repository = await tx.repository.create({
    data: {
      githubRepoId: repoMeta.githubRepoId,
      name: repoMeta.name,
      fullName: repoMeta.fullName,
      cloneUrl: repoMeta.cloneUrl,
      defaultBranch: repoMeta.defaultBranch,
    },
  });

  const deployment = await tx.deployment.create({
    data: {
      repositoryId: repository.id,
      branch: repoMeta.defaultBranch,
      buildSpec: JSON.stringify(buildSpec),
      exposedPort: buildSpec.exposedPort,
      commitSha: "UNKNOWN",
      status: "PENDING",
    },
  });

  return [repository, deployment];
});


    return deployment;
}
