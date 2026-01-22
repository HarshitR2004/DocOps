const { prisma } = require("../../../shared/config/prisma.config");
const { processDeployment } = require("./process.service");
const { stopDeployment } = require("./stop.service");

/**
 * Rollback deployment to a specific commit SHA from parent history
 * Creates a new child deployment at the target commit
 */
exports.rollbackToCommit = async (currentDeploymentId, targetCommitSha) => {
    // Fetch current deployment
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

    // Verify target commit exists in parent history
    const targetDeployment = await findDeploymentByCommitInHistory(currentDeploymentId, targetCommitSha);
    
    if (!targetDeployment) {
        throw new Error(`Commit ${targetCommitSha} not found in deployment history`);
    }

    // Use the build spec from the target deployment
    const buildSpec = JSON.parse(targetDeployment.buildSpec);

    // Stop current deployment
    try {
        if (currentDeployment.status === 'RUNNING') {
            await stopDeployment(currentDeploymentId);
        }
    } catch (e) {
        console.warn("Failed to stop current deployment:", e.message);
    }

    // Create new deployment with parent reference to current deployment
    const newDeployment = await prisma.deployment.create({
        data: {
            repositoryId: currentDeployment.repositoryId,
            branch: currentDeployment.branch,
            commitSha: targetCommitSha, // Set target commit SHA
            buildSpec: JSON.stringify(buildSpec),
            exposedPort: buildSpec.exposedPort,
            status: "PENDING",
            parentDeploymentId: currentDeploymentId // Link to current as parent
        },
        include: { repository: true }
    });

    // Process deployment at specific commit
    try {
        await processDeployment(newDeployment);
    } catch (e) {
        console.error("Failed to process rollback deployment:", e);
        await prisma.deployment.update({
            where: { id: newDeployment.id },
            data: { status: "FAILED" }
        });
        throw e;
    }

    return newDeployment;
};

/**
 * Helper function to find a deployment by commit SHA in parent history
 */
async function findDeploymentByCommitInHistory(deploymentId, targetCommitSha) {
    let current = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { parentDeployment: true }
    });

    // Check current deployment
    if (current.commitSha === targetCommitSha) {
        return current;
    }

    // Traverse parent chain
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
