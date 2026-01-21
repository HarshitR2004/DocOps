import React, { useEffect, useState } from 'react'
import { useDeployment } from '../hooks/useDeployment'
import { getStatusColor, formatDate } from '../../../utils/deploymentUtils'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import RedeployModal from './RedeployModal'
import { socketService } from '../../../shared/services/socket'

const DeploymentDetails = ({ deploymentId }) => {
  const navigate = useNavigate()
  const [isRedeployModalOpen, setIsRedeployModalOpen] = useState(false)
  const {
    deployment,
    loading,
    error,
    fetchDeployment
  } = useDeployment(deploymentId)


  useEffect(() => {
    fetchDeployment()
    
    // Subscribe to real-time status updates
    socketService.subscribeToStatus(deploymentId, (data) => {
        if (data.deploymentId === deploymentId) {
            fetchDeployment()
        }
    })

    return () => {
    }
  }, [deploymentId, fetchDeployment])

  if (!deploymentId) return <div className="text-center py-8 text-secondary font-mono">Select a deployment</div>
  if (loading) return <div className="text-secondary font-mono p-4">Loading configuration...</div>
  if (error) return <div className="text-danger font-mono p-4">Error loading configuration</div>
  if (!deployment) return <div className="text-secondary font-mono p-4">Deployment not found</div>

  return (
    <div className="space-y-6 animate-enter">
      {/* Overview Card */}
      <div className="glass-panel p-5 rounded-sm tech-border">
          <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
             <h4 className="text-xs font-bold text-primary uppercase tracking-widest">System Overview</h4>
          </div>
          
          <dl className="space-y-3 text-xs font-mono">
             <div className="flex justify-between">
                <dt className="text-dim">Repository</dt>
                <dd className="text-text-primary text-right">{deployment.repository?.name}</dd>
             </div>
             <div className="flex justify-between">
                <dt className="text-dim">Branch</dt>
                <dd className="text-text-primary text-right">{deployment.branch}</dd>
             </div>
             <div className="flex justify-between">
                <dt className="text-dim">Port</dt>
                <dd className="text-primary font-bold text-right">{deployment.exposedPort}</dd>
             </div>
             <div className="flex justify-between">
                <dt className="text-dim">Created</dt>
                <dd className="text-text-primary text-right">{formatDate(deployment.createdAt)}</dd>
             </div>
          </dl>
      </div>

       {/* Actions Card */}
       <div className="glass-panel p-5 rounded-sm tech-border">
          <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest border-b border-primary/20 pb-2">
             Control Interface
          </h4>
          <div className="grid grid-cols-1 gap-3">
             {deployment.status === 'RUNNING' && deployment.exposedPort && (
                <a
                    href={`http://localhost:${deployment.exposedPort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center px-4 py-2 bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-all font-bold uppercase tracking-widest text-xs rounded-sm"
                >
                    Launch
                </a>
             )}
             
             <button
                onClick={() => setIsRedeployModalOpen(true)}
                className="text-center px-4 py-2 bg-white/5 border border-white/10 text-secondary hover:bg-white/10 hover:text-white transition-all font-bold uppercase tracking-widest text-xs rounded-sm"
             >
                Reconfigure
             </button>
          </div>
       </div>

       <RedeployModal 
          isOpen={isRedeployModalOpen}
          onClose={() => setIsRedeployModalOpen(false)}
          deploymentId={deploymentId}
          onRedeploySuccess={() => {
              fetchDeployment()
          }}
       />

       </div>
  )
}

export default DeploymentDetails
