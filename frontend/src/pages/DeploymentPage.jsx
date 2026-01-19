import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDeployment } from '../hooks/useDeployment'
import DeploymentDetails from '../components/ui/DeploymentDetails'
import LogViewer from '../components/ui/LogViewer'
import { socketService } from '../services/socket'

const DeploymentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deployment, loading, error, fetchDeployment } = useDeployment(id)
  
  // Auto-switch logs type based on status
  const logType = deployment?.status === 'BUILDING' || deployment?.status === 'PENDING' ? 'build' : 'runtime'

  useEffect(() => {
    fetchDeployment()
    
    // Subscribe to status updates for real-time refresh
    const handleStatusUpdate = (update) => {
        if (update && update.deploymentId === id) {
            fetchDeployment();
        }
    };
    
    socketService.subscribeToStatus(id, handleStatusUpdate);

    // Poll for updates if status is transitional (backup)
    const interval = setInterval(() => {
        if (deployment && ['BUILDING', 'PENDING'].includes(deployment.status)) {
            fetchDeployment()
        }
    }, 5000)
    return () => {
        clearInterval(interval);
        // Clean up socket listener if needed or rely on component unmount
    }
  }, [id, fetchDeployment, deployment?.status])

  if (loading && !deployment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-danger font-mono font-bold border border-danger p-4 bg-danger/10">ERROR:: {error}</div>
        <button 
          onClick={() => navigate('/')}
          className="text-primary hover:underline font-mono uppercase text-sm"
        >
          &lt; Return to Command Center
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb / Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-dim uppercase tracking-wider mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>&lt;</span> COMMAND_CENTER
          </button>
          <span className="text-secondary">/</span>
          <span className="text-text-primary font-bold">
            OPERATION_{id}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Left Column: Details */}
            <div className="lg:col-span-4 overflow-y-auto pr-2 custom-scrollbar">
                <DeploymentDetails deploymentId={id} />
            </div>

            {/* Right Column: Logs */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                <div className="glass-panel tech-border p-1 flex-1 flex flex-col relative overflow-hidden">
                     {/* Decorative Header for Log Panel */}

                    
                    <LogViewer 
                        deploymentId={id} 
                        logType={logType} 
                        isModal={false} 
                        onClose={() => {}} 
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default DeploymentPage
