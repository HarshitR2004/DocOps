const { prisma } = require("../../../shared/config/prisma.config");
const { run } = require("./utils");
const { processDeployment } = require("./process.service");
const { stopDeployment } = require("./stop.service");
const deployQueue = require("../deploy.queue");

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
           console.warn("Failed to remove old container:", e.message);
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
    console.log(`\n[REDEPLOY] Starting redeployment from parent: ${deploymentId}`);
    console.log(`[REDEPLOY] Target branch: ${branch}`);
    
    const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { container: true, repository: true }
    });

    if (!deployment) {
        console.log(`[REDEPLOY] ❌ Deployment not found: ${deploymentId}`);
        throw new Error("Deployment not found");
    }
    
    console.log(`[REDEPLOY] ✓ Parent deployment found`);
    console.log(`[REDEPLOY] Repository: ${deployment.repository.name}`);
    console.log(`[REDEPLOY] Current status: ${deployment.status}`);

    const buildSpec = JSON.parse(deployment.buildSpec);
    console.log(`[REDEPLOY] Build spec loaded:`, buildSpec); 

    console.log(`[REDEPLOY] Stopping parent deployment...`);
    try{
        await stopDeployment(deploymentId);
        console.log(`[REDEPLOY] ✓ Parent deployment stopped`);
    } catch(e) {
        console.log("[REDEPLOY] ⚠ Failed to stop old deployment:", e.message);
    }
    
    console.log(`[REDEPLOY] Creating new child deployment...`);
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
    
    console.log(`[REDEPLOY] ✓ New deployment created: ${newDeployment.id}`);
    console.log(`[REDEPLOY] Parent link: ${deploymentId} → ${newDeployment.id}`);

    console.log(`[REDEPLOY] Starting deployment process...`);
    try {
        await processDeployment(newDeployment);
        console.log(`[REDEPLOY] ✓ Deployment processing completed`);
    } catch(e) {
        console.log(`[REDEPLOY] ❌ Failed to process new deployment:`, e.message);
        await prisma.deployment.update({
            where: { id: newDeployment.id },
            data: { status: "FAILED" }
        });
    }

    return newDeployment;
};
