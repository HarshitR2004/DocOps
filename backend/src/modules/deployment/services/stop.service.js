const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");
const ioManager = require("../../../shared/infrastructure/sockets/io");

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

    const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'STOPPED' },
        include: { container: true }
    });

    ioManager.get().to(`deployment-${deploymentId}`).emit("deployment-status", {
        deploymentId: deploymentId,
        status: "STOPPED"
    });

    return updatedDeployment;
};
