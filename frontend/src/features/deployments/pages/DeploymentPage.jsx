import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDeployment } from '../hooks/useDeployment'
import DeploymentDetails from '../components/DeploymentDetails'
import LogViewer from '../../../shared/components/LogViewer'
import { socketService } from '../../../shared/services/socket'
import { ArrowLeft, RefreshCw } from 'lucide-react'

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
            fetchDeployment(true);
        }
    };
    
    socketService.subscribeToStatus(id, handleStatusUpdate);

    // Subscribe to new deployment events (e.g. from webhook or rollback)
    const handleNewDeployment = (data) => {
        if (data && data.newDeploymentId) {
            navigate(`/deployments/${data.newDeploymentId}`);
        }
    };

    socketService.subscribeToNewDeployment(id, handleNewDeployment);

    // Poll for updates if status is transitional (backup)
    const interval = setInterval(() => {
        if (deployment && ['BUILDING', 'PENDING'].includes(deployment.status)) {
            fetchDeployment(true)
        }
    }, 5000)
    return () => {
        clearInterval(interval);
        socketService.unsubscribeFromNewDeployment();
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
          onClick={() => navigate('/deployments')}
          className="text-primary hover:underline font-mono uppercase text-sm"
        >
          &lt; Return to Operations
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black/95 flex flex-col">
       {/* Dashboard Header */}
       <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/deployments')}
                    className="p-2 text-dim hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                     <h1 className="text-lg font-bold text-white font-mono tracking-wide uppercase">
                        {deployment?.repository?.name || 'Loading...'}
                     </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <div className={`px-3 py-1 rounded-full border text-xs font-bold font-mono uppercase tracking-wider ${
                     deployment?.status === 'RUNNING' ? 'border-success/30 text-success bg-success/5' :
                     deployment?.status === 'FAILED' ? 'border-danger/30 text-danger bg-danger/5' :
                     'border-warning/30 text-warning bg-warning/5 animate-pulse'
                 }`}>
                     {deployment?.status || 'UNKNOWN'}
                 </div>
            </div>
       </header>

       {/* Dashboard Content */}
       <div className="flex-1 p-6 overflow-hidden">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                
                {/* Left Panel: Configuration & Controls */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                     <DeploymentDetails deploymentId={id} />
                </div>

                {/* Right Panel: Terminal / Logs */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
                    <div className="glass-panel tech-border p-1 flex-1 flex flex-col relative overflow-hidden shadow-2xl">
                         <div className="h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                             <div className="ml-4 text-[10px] font-mono text-dim uppercase tracking-widest">
                                 System_Logs_Stream // {logType.toUpperCase()}
                             </div>
                         </div>
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
