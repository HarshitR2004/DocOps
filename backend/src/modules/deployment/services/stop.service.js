const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");

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
