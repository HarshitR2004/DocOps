import React, { useState } from 'react'
import DeploymentItem from './DeploymentItem'
import { useDeployments } from '../hooks/useDeployments' // still needed for delete action
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../shared/components/ConfirmModal'
import { LayoutGrid, List as ListIcon } from 'lucide-react'

/**
 * Component to display a list of deployments
 */
const DeploymentList = ({ deployments = [], loading, onRefresh }) => {
  const navigate = useNavigate()
  const {
    error,
    deletingId,
    deleteDeployment
  } = useDeployments()

  const [deploymentToDelete, setDeploymentToDelete] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const handleView = (deploymentId) => {
    navigate(`/deployments/${deploymentId}`)
  }

  const confirmDelete = (deployment) => {
    setDeploymentToDelete(deployment)
  }

  const handleDelete = async () => {
    if (deploymentToDelete) {
      await deleteDeployment(deploymentToDelete)
      setDeploymentToDelete(null)
      if (onRefresh) onRefresh()
    }
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
      <div className="glass-panel p-12 rounded-lg text-center border-dashed border-2 border-white/10">
        <div className="text-secondary font-mono mb-4 text-4xl opacity-20">NULL</div>
        <p className="text-secondary font-mono">No active deployments found. Initialize one to begin.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2 mb-4">
             <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-dim hover:text-white'}`}
             >
                 <LayoutGrid size={16} />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-dim hover:text-white'}`}
             >
                 <ListIcon size={16} />
             </button>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          {deployments.map((deployment, index) => (
            <div key={deployment.id} className={`animate-enter delay-${Math.min(index * 100, 500)}`}>
              <DeploymentItem
                  deployment={deployment}
                  onDelete={() => confirmDelete(deployment)}
                  isDeleting={deletingId === deployment.id}
                  onViewLogs={handleView}
                  onRefresh={onRefresh}
                  viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deploymentToDelete}
        onClose={() => setDeploymentToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm Termination"
        message="Are you sure you want to terminate this deployment? This action will stop all running containers and permanently remove configuration data."
        isLoading={!!deletingId}
      />
    </>
  )
}

export default DeploymentList
