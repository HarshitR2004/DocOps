import React, { useEffect, useState } from 'react'
import { deployService } from '../../services/deployService'
import clsx from 'clsx'

/**
 * Component to display detailed information about a specific deployment
 * @param {Object} props
 * @param {string} props.deploymentId - The ID of the deployment to display
 */
const DeploymentDetails = ({ deploymentId }) => {
  const [deployment, setDeployment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (deploymentId) {
      fetchDeployment()
    }
  }, [deploymentId])

  const fetchDeployment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await deployService.getDeploymentById(deploymentId)
      setDeployment(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'BUILDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (!deploymentId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No deployment selected</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
        <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
        <button
          onClick={fetchDeployment}
          className="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Deployment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Deployment Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            ID: {deployment.id}
          </p>
        </div>
        <button
          onClick={fetchDeployment}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Badge */}
      <div
        className={clsx(
          'inline-flex items-center px-4 py-2 rounded-lg border font-medium',
          getStatusColor(deployment.status)
        )}
      >
        Status: {deployment.status}
      </div>

      {/* Repository Information */}
      {deployment.repository && (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Repository Information
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Name: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400">{deployment.repository.name}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Full Name: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400">{deployment.repository.fullName}</dd>
            </div>
            {deployment.repository.cloneUrl && (
              <div>
                <dt className="inline font-medium text-gray-700 dark:text-gray-300">Clone URL: </dt>
                <dd className="inline">
                  <a
                    href={deployment.repository.cloneUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {deployment.repository.cloneUrl}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Deployment Information */}
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Deployment Information
        </h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="inline font-medium text-gray-700 dark:text-gray-300">Branch: </dt>
            <dd className="inline text-gray-600 dark:text-gray-400 font-mono">{deployment.branch}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-gray-700 dark:text-gray-300">Commit SHA: </dt>
            <dd className="inline text-gray-600 dark:text-gray-400 font-mono">{deployment.commitSha}</dd>
          </div>
          {deployment.imageTag && (
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Image Tag: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400 font-mono">{deployment.imageTag}</dd>
            </div>
          )}
          {deployment.containerId && (
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Container ID: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400 font-mono">{deployment.containerId.substring(0, 12)}</dd>
            </div>
          )}
          {deployment.exposedPort && (
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Exposed Port: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400 font-mono">{deployment.exposedPort}</dd>
            </div>
          )}
          <div>
            <dt className="inline font-medium text-gray-700 dark:text-gray-300">Created: </dt>
            <dd className="inline text-gray-600 dark:text-gray-400">{formatDate(deployment.createdAt)}</dd>
          </div>
          {deployment.updatedAt && (
            <div>
              <dt className="inline font-medium text-gray-700 dark:text-gray-300">Updated: </dt>
              <dd className="inline text-gray-600 dark:text-gray-400">{formatDate(deployment.updatedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Action Buttons */}
      {deployment.status === 'RUNNING' && deployment.exposedPort && (
        <div className="flex gap-3">
          <a
            href={`http://localhost:${deployment.exposedPort}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Open Application
          </a>
        </div>
      )}
    </div>
  )
}

export default DeploymentDetails
