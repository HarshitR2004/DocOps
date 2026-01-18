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

export const deployService = {
  deployPublicRepo,
  getDeploymentById,
  getDeploymentLogs,
  listDeployments,
  startDeployment,
  stopDeployment,
  deleteDeployment,
};
