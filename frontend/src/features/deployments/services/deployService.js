const BASE_URL = "http://localhost:8080";

/**
 * Deploy a public repository
 * @param {Object} data - Deployment data
 * @param {string} data.repoUrl - GitHub repository URL
 * @param {string} [data.branch="main"] - Branch to deploy (defaults to "main")
 * @returns {Promise<Object>} Deployment response with deploymentId
 */
const deployPublicRepo = async (data) => {
  const response = await fetch(`${BASE_URL}/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Deployment failed");
  }

  return response.json();
};

/**
 * Get deployment by ID
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Deployment details
 */
const getDeploymentById = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch deployment");
  }

  return response.json();
};

/**
 * Get deployment logs
 * @param {string} deploymentId - Deployment ID
 * @param {string} type - 'build', 'runtime', or 'all'
 * @returns {Promise<Object>} Deployment logs
 */
const getDeploymentLogs = async (deploymentId, type = "all") => {
  const fetchLog = async (filename) => {
      try {
          const res = await fetch(`${BASE_URL}/logs/${deploymentId}/${filename}`);
          return res.ok ? await res.text() : "";
      } catch {
          return "";
      }
  };

  if (type === 'build') {
      return { buildLogs: await fetchLog('build.log') };
  } else if (type === 'runtime') {
      return { runtimeLogs: await fetchLog('runtime.log') };
  } else {
      const [buildLogs, runtimeLogs] = await Promise.all([
          fetchLog('build.log'),
          fetchLog('runtime.log')
      ]);
      return { buildLogs, runtimeLogs };
  }
};

/**
 * List all deployments
 * @returns {Promise<Array>} List of deployments
 */
const listDeployments = async () => {
  const response = await fetch(`${BASE_URL}/deploy`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch deployments");
  }

  return response.json();
};

/**
 * Start a deployment
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Start response
 */
const startDeployment = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}/start`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start deployment");
  }

  return response.json();
};

/**
 * Stop a deployment
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Stop response
 */
const stopDeployment = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}/stop`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to stop deployment");
  }

  return response.json();
};

/**
 * Delete a deployment by ID (also deletes associated containers)
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Delete response
 */
const deleteDeployment = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete deployment");
  }

  return response.json();
};

/**
 * Redeploy a deployment with updated config
 * @param {string} deploymentId - Deployment ID
 * @param {Object} buildSpec - New build specification
 * @returns {Promise<Object>} Redeploy response
 */
const redeployDeployment = async (deploymentId, buildSpec) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ buildSpec }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to redeploy");
  }

  return response.json();
};

/**
 * Get deployment configuration
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Deployment configuration
 */
const getDeploymentConfig = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}/config`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch deployment config");
  }

  return response.json();
};

/**
 * Get deployment history (parent deployment chain)
 * @param {string} deploymentId - Deployment ID
 * @returns {Promise<Object>} Deployment history with commit SHAs
 */
const getDeploymentHistory = async (deploymentId) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}/history`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch deployment history");
  }

  return response.json();
};

/**
 * Rollback deployment to a specific commit SHA
 * @param {string} deploymentId - Current deployment ID
 * @param {string} targetCommitSha - Target commit SHA to rollback to
 * @returns {Promise<Object>} Rollback response
 */
const rollbackDeployment = async (deploymentId, targetCommitSha) => {
  const response = await fetch(`${BASE_URL}/deploy/${deploymentId}/rollback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ targetCommitSha }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to rollback deployment");
  }

  return response.json();
};

export const deployService = {
  deployPublicRepo,
  getDeploymentById,
  getDeploymentLogs,
  listDeployments,
  startDeployment,
  stopDeployment,
  deleteDeployment,
  redeployDeployment,
  getDeploymentConfig,
  getDeploymentHistory,
  rollbackDeployment,
};
