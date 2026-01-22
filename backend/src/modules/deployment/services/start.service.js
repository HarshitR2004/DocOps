const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");

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
