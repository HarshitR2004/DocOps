const { prisma } = require("../../../shared/config/prisma.config");

exports.getDeploymentHistory = async (deploymentId) => {
    const history = [];
    
    let currentDeployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        include: { 
            repository: true,
            container: true,
            parentDeployment: true 
        }
    });

    if (!currentDeployment) {
        throw new Error("Deployment not found");
    }

    history.push({
        id: currentDeployment.id,
        commitSha: currentDeployment.commitSha,
        status: currentDeployment.status,
        createdAt: currentDeployment.createdAt,
        branch: currentDeployment.branch,
        isCurrent: true
    });

    let parent = currentDeployment.parentDeployment;
    while (parent) {
        history.push({
            id: parent.id,
            commitSha: parent.commitSha,
            status: parent.status,
            createdAt: parent.createdAt,
            branch: parent.branch,
            isCurrent: false
        });

        // Fetch next parent
        if (parent.parentDeploymentId) {
            parent = await prisma.deployment.findUnique({
                where: { id: parent.parentDeploymentId },
                include: { parentDeployment: true }
            });
        } else {
            parent = null;
        }
    }

    return history;
};


exports.getRepositoryDeployments = async (repositoryId, branch) => {
    return await prisma.deployment.findMany({
        where: { 
            repositoryId, 
            branch 
        },
        orderBy: { createdAt: 'desc' },
        include: { 
            container: true,
            repository: true 
        }
    });
};
