/**
 * Utility functions for deployment-related operations
 */

/**
 * Get color classes based on deployment status
 * @param {string} status - Deployment status
 * @returns {string} Tailwind CSS classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    RUNNING: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
    BUILDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
    STOPPED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  }

  return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
}

/**
 * Format date to locale string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

/**
 * Validate GitHub repository URL
 * @param {string} url - Repository URL
 * @returns {boolean} Whether the URL is valid
 */
export const isValidGitHubUrl = (url) => {
  if (!url) return false
  
  const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/
  return githubUrlPattern.test(url.trim())
}

/**
 * Extract repository name from URL
 * @param {string} url - Repository URL
 * @returns {string|null} Repository name or null
 */
export const extractRepoName = (url) => {
  if (!url) return null
  
  try {
    const parts = url.split('/')
    return parts[parts.length - 1].replace('.git', '')
  } catch {
    return null
  }
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return `${str.substring(0, maxLength)}...`
}

/**
 * Get deployment URL
 * @param {Object} deployment - Deployment object
 * @returns {string|null} Deployment URL or null
 */
export const getDeploymentUrl = (deployment) => {
  if (deployment?.status === 'RUNNING' && deployment?.exposedPort) {
    return `http://localhost:${deployment.exposedPort}`
  }
  return null
}
