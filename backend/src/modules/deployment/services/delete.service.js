const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");
const fs = require('fs');
const path = require("path");

exports.deleteDeployment = async (deploymentId) => {
  return prisma.$transaction(async (tx) => {
    const deployment = await tx.deployment.findUnique({
      where: { id: deploymentId },
      include: { container: true },
    });

    if (!deployment) throw new Error("Deployment not found");

    if (deployment.container && deployment.container.dockerContainerId) {
      try {
        await run(`docker rm -f ${deployment.container.dockerContainerId}`);
        await run (`docker rmi -f ${deployment.container.dockerContainerId}`);
      } catch (e) {      }
    }

    try {
      let baseDir = process.env.BASE_LOG_DIR || "";
      baseDir = baseDir.replace(/^"|"$/g, "");
      const logDir = path.join(baseDir, deploymentId);

      if (fs.existsSync(logDir)) {
        await fs.promises.rm(logDir, { recursive: true, force: true });
      }
    } catch (e) {    }

    await tx.deployment.delete({
      where: { id: deploymentId },
    });

    await tx.repository.deleteMany({
      where: {
        deployments: {
          none: {},
        },
      },
    });

    return { success: true };
  });
};


