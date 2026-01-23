const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");
const { processDeployment } = require("./process.service");
const { stopDeployment } = require("./stop.service");
const deployQueue = require("../deploy.queue");
const ioManager = require("../../../shared/infrastructure/sockets/io");

exports.redeployDeployment = async (deploymentId, newBuildSpec) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true, repository: true }
    });

    if (!deployment) throw new Error("Deployment not found");

    if (deployment.container && deployment.container.dockerContainerId) {
        try {
           await run(`docker rm -f ${deployment.container.dockerContainerId}`);
        } catch (e) {
        }
    }

    const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
            buildSpec: newBuildSpec ? JSON.stringify(newBuildSpec) : deployment.buildSpec,
            exposedPort: newBuildSpec?.exposedPort ? newBuildSpec.exposedPort: deployment.exposedPort,
            status: "PENDING",
            container: {
                delete: deployment.container ? true : undefined
            }
        },
        include: { repository: true }
    });

    processDeployment(updatedDeployment);

    return updatedDeployment;
};


exports.redeployFromParent = async (deploymentId, branch) => {
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true, repository: true }
    });

    if (!deployment) {
        throw new Error("Deployment not found");
    }

    const buildSpec = JSON.parse(deployment.buildSpec);

    try{
        await stopDeployment(deploymentId);
    } catch(e) {
    }
    
    const newDeployment = await prisma.deployment.create({
        data: {
            repositoryId: deployment.repositoryId,
            branch: branch,
            commitSha: "UNKNOWN",
            buildSpec: JSON.stringify(buildSpec),
            exposedPort: buildSpec.exposedPort,
            status: "PENDING",
            parentDeploymentId: deploymentId
        },
        include: { repository: true }
    });

    ioManager.get().to(`deployment-${deploymentId}`).emit("new-deployment", {
        newDeploymentId: newDeployment.id
    });

    try {
        await processDeployment(newDeployment);
    } catch(e) {
        await prisma.deployment.update({
            where: { id: newDeployment.id },
            data: { status: "FAILED" }
        });
    }

    return newDeployment;
};
