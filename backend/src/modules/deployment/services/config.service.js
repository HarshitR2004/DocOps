const { prisma } = require("../../../shared/config/prisma.config");

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
