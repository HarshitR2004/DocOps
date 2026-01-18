import React, { useEffect, useState } from 'react'
import { deployService } from '../../services/deployService'
import { containerService } from '../../services/containerService'
import clsx from 'clsx'

/**
 * Component to display a list of deployments
 */
const DeploymentList = ({ refreshTrigger }) => {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [actioningContainerId, setActioningContainerId] = useState(null)
  const [actionType, setActionType] = useState(null)

  useEffect(() => {
    fetchDeployments()
  }, [refreshTrigger])

  const fetchDeployments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await deployService.listDeployments()
      setDeployments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deployment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deployment and its container(s)? This cannot be undone."
    )
    if (!confirmed) return

    try {
      setDeletingId(deployment.id)

      if (deployment.containers && deployment.containers.length > 0) {
        for (const container of deployment.containers) {
          await containerService.deleteContainer(container.id)
        }
      }

      await deployService.deleteDeployment(deployment.id)
      setDeployments((prev) => prev.filter((d) => d.id !== deployment.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleStartContainer = async (containerId) => {
    try {
      setActioningContainerId(containerId)
      setActionType('start')
      await containerService.startContainer(containerId)
      await fetchDeployments()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  const handleStopContainer = async (containerId) => {
    try {
      setActioningContainerId(containerId)
      setActionType('stop')
      await containerService.stopContainer(containerId)
      await fetchDeployments()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  const handleDeleteContainer = async (containerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this container? This cannot be undone."
    )
    if (!confirmed) return

    try {
      setActioningContainerId(containerId)
      setActionType('delete')
      await containerService.deleteContainer(containerId)
      await fetchDeployments()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'BUILDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'STOPPED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
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
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No deployments yet. Start your first deployment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Deployments
        </h3>
        <button
          onClick={fetchDeployments}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {deployment.repository?.name || 'Unknown Repository'}
                  </h4>
                  <span
                    className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusColor(deployment.status)
                    )}
                  >
                    {deployment.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Branch: <span className="font-mono">{deployment.branch}</span></p>
                  <p>Commit: <span className="font-mono text-xs">{deployment.commitSha?.substring(0, 7)}</span></p>
                  {deployment.exposedPort && (
                    <p>Port: <span className="font-mono">{deployment.exposedPort}</span></p>
                  )}
                  <p className="text-xs">
                    Created: {formatDate(deployment.createdAt)}
                  </p>
                </div>
              </div>

              {deployment.status === 'RUNNING' && deployment.exposedPort && (
                <a
                  href={`http://localhost:${deployment.exposedPort}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View
                </a>
              )}
              <button
                onClick={() => handleDelete(deployment)}
                disabled={deletingId === deployment.id}
                className={clsx(
                  'ml-3 px-3 py-1 text-sm rounded-md transition-colors',
                  'bg-red-600 text-white hover:bg-red-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {deletingId === deployment.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>

            {deployment.repository?.fullName && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={deployment.repository.cloneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {deployment.repository.fullName}
                </a>
              </div>
            )}

            {deployment.containers && deployment.containers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Containers</h5>
                <div className="space-y-2">
                  {deployment.containers.map((container) => (
                    <div
                      key={container.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {container.dockerContainerId.substring(0, 12)}
                          </span>
                          <span
                            className={clsx(
                              'px-2 py-0.5 text-xs font-medium rounded',
                              getStatusColor(container.status)
                            )}
                          >
                            {container.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Port: <span className="font-mono">{container.port}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {container.status === 'RUNNING' && (
                          <button
                            onClick={() => handleStopContainer(container.id)}
                            disabled={actioningContainerId === container.id}
                            className={clsx(
                              'px-2 py-1 text-xs rounded transition-colors',
                              'bg-yellow-600 text-white hover:bg-yellow-700',
                              'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                          >
                            {actioningContainerId === container.id && actionType === 'stop' ? 'Stopping...' : 'Stop'}
                          </button>
                        )}
                        {container.status === 'STOPPED' && (
                          <button
                            onClick={() => handleStartContainer(container.id)}
                            disabled={actioningContainerId === container.id}
                            className={clsx(
                              'px-2 py-1 text-xs rounded transition-colors',
                              'bg-green-600 text-white hover:bg-green-700',
                              'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                          >
                            {actioningContainerId === container.id && actionType === 'start' ? 'Starting...' : 'Start'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContainer(container.id)}
                          disabled={actioningContainerId === container.id}
                          className={clsx(
                            'px-2 py-1 text-xs rounded transition-colors',
                            'bg-red-600 text-white hover:bg-red-700',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          {actioningContainerId === container.id && actionType === 'delete' ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeploymentList
