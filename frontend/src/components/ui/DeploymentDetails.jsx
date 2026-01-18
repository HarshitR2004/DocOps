import React, { useEffect } from 'react'
import { useDeployment } from '../../hooks/useDeployment'
import { getStatusColor, formatDate } from '../../utils/deploymentUtils'
import clsx from 'clsx'

/**
 * Component to display detailed information about a specific deployment
 * @param {Object} props
 * @param {string} props.deploymentId - The ID of the deployment to display
 */
const DeploymentDetails = ({ deploymentId }) => {
  const {
    deployment,
    loading,
    error,
    fetchDeployment
  } = useDeployment(deploymentId)

  useEffect(() => {
    fetchDeployment()
  }, [deploymentId, fetchDeployment])

  if (!deploymentId) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary font-mono">No deployment selected</p>
      </div>
    )
  }

  if (loading) {
     return (
        <div className="flex items-center justify-center py-8">
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin"></div>
            </div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-sm border border-danger/30 bg-danger/10 text-danger font-mono text-xs">
        <p className="font-bold mb-2">ERROR::FETCH_FAILED</p>
        <p>{error}</p>
        <button
          onClick={fetchDeployment}
          className="mt-3 text-xs border border-danger px-3 py-1 hover:bg-danger hover:text-white transition-colors uppercase"
        >
          Recall Data
        </button>
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary font-mono">Deployment data not found in registry.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1 tracking-tight font-mono uppercase">
            Operation Details
          </h3>
          <p className="text-[10px] text-dim font-mono uppercase tracking-widest">
            ID: <span className="text-primary">{deployment.id}</span>
          </p>
        </div>
        <button
          onClick={fetchDeployment}
          className="px-3 py-1.5 text-xs bg-surface border border-border text-secondary rounded-sm hover:border-primary hover:text-primary transition-colors font-mono uppercase"
        >
          Sync Data
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-secondary uppercase">Current Status:</span>
        <div
            className={clsx(
            'inline-flex items-center px-3 py-1 rounded-sm border font-bold text-xs uppercase tracking-wider',
            getStatusColor(deployment.status)
            )}
        >
            {deployment.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repository Information */}
        {deployment.repository && (
            <div className="glass-panel p-5 rounded-sm tech-border">
            <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest border-b border-primary/20 pb-2">
                Source Repository
            </h4>
            <dl className="space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                    <dt className="text-dim">Name</dt>
                    <dd className="text-text-primary text-right">{deployment.repository.name}</dd>
                </div>
                {deployment.repository.cloneUrl && (
                <div className="flex flex-col gap-1 mt-2">
                    <dt className="text-dim">Clone URL</dt>
                    <dd className="text-right truncate w-full">
                        <a
                            href={deployment.repository.cloneUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-white transition-colors hover:underline"
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
        <div className="glass-panel p-5 rounded-sm tech-border">
            <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest border-b border-primary/20 pb-2">
            Configuration
            </h4>
            <dl className="space-y-3 text-xs font-mono">
            <div className="flex justify-between">
                <dt className="text-dim">Target Branch</dt>
                <dd className="text-text-primary">{deployment.branch}</dd>
            </div>
            {deployment.exposedPort && (
                <div className="flex justify-between">
                    <dt className="text-dim">Exposed Port</dt>
                    <dd className="text-primary font-bold">{deployment.exposedPort}</dd>
                </div>
            )}
            <div className="flex justify-between">
                <dt className="text-dim">Initiated At</dt>
                <dd className="text-text-primary">{formatDate(deployment.createdAt)}</dd>
            </div>
            </dl>
        </div>
      </div>


      {/* Action Buttons */}
      {deployment.status === 'RUNNING' && deployment.exposedPort && (
        <div className="pt-4">
          <a
            href={`http://localhost:${deployment.exposedPort}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-3 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black transition-all font-bold uppercase tracking-widest text-sm rounded-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Launch Application Interface
          </a>
        </div>
      )}
    </div>
  )
}

export default DeploymentDetails
