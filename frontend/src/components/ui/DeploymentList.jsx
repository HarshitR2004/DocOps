import React, { useEffect } from 'react'
import DeploymentItem from './DeploymentItem'
import { useDeployments } from '../../hooks/useDeployments'
import { useNavigate } from 'react-router-dom'

/**
 * Component to display a list of deployments
 */
const DeploymentList = ({ refreshTrigger }) => {
  const navigate = useNavigate()
  const {
    deployments,
    loading,
    error,
    deletingId,
    fetchDeployments,
    deleteDeployment
  } = useDeployments()

  useEffect(() => {
    fetchDeployments()
  }, [refreshTrigger, fetchDeployments])
  
  const handleView = (deploymentId) => {
    navigate(`/deployment/${deploymentId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-danger/10 border border-danger/30 text-danger font-mono text-sm">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-lg text-center">
        <p className="text-secondary font-mono">No active deployments found initialization pending...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary font-mono tracking-wider uppercase">
          Active Modules
        </h3>
        <button
          onClick={fetchDeployments}
          className="text-xs font-mono text-secondary hover:text-primary transition-colors flex items-center gap-2"
        >
          <span>[ REFRESH DATA ]</span>
        </button>
      </div>

      <div className="grid gap-4">
        {deployments.map((deployment, index) => (
          <div key={deployment.id} className={`animate-enter delay-${Math.min(index * 100, 500)}`}>
            <DeploymentItem
                deployment={deployment}
                onDelete={deleteDeployment}
                isDeleting={deletingId === deployment.id}
                onViewLogs={handleView}
                onRefresh={fetchDeployments}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeploymentList
