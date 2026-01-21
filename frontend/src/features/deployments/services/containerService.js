const BASE_URL = "http://localhost:8080";

/**
 * Start a stopped container
 * @param {string} containerId - Container ID
 * @returns {Promise<Object>} Container response
 */
const startContainer = async (containerId) => {
  const response = await fetch(`${BASE_URL}/container/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ containerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start container");
  }

  return response.json();
};

/**
 * Stop a running container
 * @param {string} containerId - Container ID
 * @returns {Promise<Object>} Container response
 */
const stopContainer = async (containerId) => {
  const response = await fetch(`${BASE_URL}/container/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ containerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to stop container");
  }

  return response.json();
};

/**
 * Delete a container
 * @param {string} containerId - Container ID
 * @returns {Promise<Object>} Delete response
 */
const deleteContainer = async (containerId) => {
  const response = await fetch(`${BASE_URL}/container/${containerId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete container");
  }

  return response.json();
};

export const containerService = {
  startContainer,
  stopContainer,
  deleteContainer,
};
