const { prisma } = require("../../../shared/config/prisma.config");
const { processDeployment } = require("./process.service");
const { stopDeployment } = require("./stop.service");
const ioManager = require("../../../shared/infrastructure/sockets/io");


exports.rollbackToCommit = async (currentDeploymentId, targetCommitSha) => {
    const currentDeployment = await prisma.deployment.findUnique({
        where: { id: currentDeploymentId },
        include: { 
            container: true, 
            repository: true 
        }
    });

    if (!currentDeployment) {
        throw new Error("Current deployment not found");
    }

    const targetDeployment = await findDeploymentByCommitInHistory(currentDeploymentId, targetCommitSha);
    
    if (!targetDeployment) {
        throw new Error(`Commit ${targetCommitSha} not found in deployment history`);
    }

    const buildSpec = JSON.parse(targetDeployment.buildSpec);

    try {
        if (currentDeployment.status === 'RUNNING') {
            await stopDeployment(currentDeploymentId);
        }
    } catch (e) {    }

    const newDeployment = await prisma.deployment.create({
        data: {
            repositoryId: currentDeployment.repositoryId,
            branch: currentDeployment.branch,
            commitSha: targetCommitSha, 
            buildSpec: JSON.stringify(buildSpec),
            exposedPort: buildSpec.exposedPort,
            status: "PENDING",
            parentDeploymentId: currentDeploymentId
        },
        include: { repository: true }
    });

    ioManager.get().to(`deployment-${currentDeploymentId}`).emit("new-deployment", {
        newDeploymentId: newDeployment.id
    });

    try {
        await processDeployment(newDeployment);
    } catch (e) {        await prisma.deployment.update({
            where: { id: newDeployment.id },
            data: { status: "FAILED" }
        });
        throw e;
    }

    return newDeployment;
};


async function findDeploymentByCommitInHistory(deploymentId, targetCommitSha) {
    let current = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { parentDeployment: true }
    });

    if (current.commitSha === targetCommitSha) {
        return current;
    }

    let parent = current.parentDeployment;
    while (parent) {
        if (parent.commitSha === targetCommitSha) {
            return parent;
        }

        if (parent.parentDeploymentId) {
            parent = await prisma.deployment.findUnique({
                where: { id: parent.parentDeploymentId },
                include: { parentDeployment: true }
            });
        } else {
            parent = null;
        }
    }

    return null;
}


