import { deployService } from '../../../services/deployService'
import { useState } from 'react'
import clsx from 'clsx'
import { getStatusColor, formatDate } from '../../../utils/deploymentUtils'
import { Play, Square, Trash2, Terminal, ExternalLink, GitBranch, Clock } from 'lucide-react'

const DeploymentItem = ({ 
  deployment, 
  onDelete, 
  isDeleting, 
  onViewLogs,
  onRefresh,
  viewMode = 'grid'
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleStart = async (e) => {
      e.stopPropagation();
      try {
          setIsToggling(true);
          await deployService.startDeployment(deployment.id);
          onRefresh();
      } catch (e) {
          console.error(e);
          alert("Failed to start: " + e.message);
      } finally {
          setIsToggling(false);
      }
  };

  const handleStop = async (e) => {
      e.stopPropagation();
      try {
          setIsToggling(true);
          await deployService.stopDeployment(deployment.id);
          onRefresh();
      } catch (e) {
           console.error(e);
           alert("Failed to stop: " + e.message);
      } finally {
          setIsToggling(false);
      }
  };

  const isGrid = viewMode === 'grid';

  return (
    <div 
        onClick={() => onViewLogs(deployment.id)}
        className={clsx(
            "glass-panel tech-border rounded-sm hover:bg-surface-hover transition-all cursor-pointer group relative overflow-hidden",
            isGrid ? "p-6 flex flex-col h-full min-h-[200px]" : "p-4 flex items-center justify-between"
        )}
    >
      <div className={clsx("absolute top-0 left-0 w-1 h-full transition-colors", 
          deployment.status === 'RUNNING' ? 'bg-success' : 
          deployment.status === 'FAILED' ? 'bg-danger' : 
          deployment.status === 'BUILDING' ? 'bg-warning animate-pulse' : 'bg-dim'
      )}></div>

      <div className={clsx("flex-1 min-w-0", isGrid ? "mb-4" : "flex flex-col")}>
        <div className="flex items-center gap-3 mb-2">
          <h4 className={clsx("font-bold text-primary font-mono tracking-tight", isGrid ? "text-xl" : "text-lg")}>
            {deployment.repository?.name || 'Unknown Module'}
          </h4>
          <span className={clsx(
              'px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-sm',
              getStatusColor(deployment.status)
            )}>
            {deployment.status}
          </span>
        </div>
        
        <div className={clsx("text-xs font-mono text-secondary", isGrid ? "space-y-2 mt-4" : "flex gap-6 mt-1")}>
            <div className="flex items-center gap-2">
               <GitBranch size={12} className="text-dim" />
               <span className="text-text-primary">{deployment.branch}</span>
            </div>
            {deployment.exposedPort && (
                <div className="flex items-center gap-2">
                    <span className="text-dim uppercase text-[10px]">Port</span>
                    <span className="text-primary">{deployment.exposedPort}</span>
                </div>
            )}
             <div className="flex items-center gap-2">
                <Clock size={12} className="text-dim" />
                <span>{formatDate(deployment.createdAt)}</span>
             </div>
        </div>
      </div>

      <div className={clsx("flex items-center gap-2", isGrid ? "mt-auto pt-4 border-t border-white/5 justify-end" : "")}>
           {(deployment.status === 'RUNNING' || deployment.status === 'BUILDING' || deployment.status === 'STOPPED') && (
            <button
               // onClick handled by parent div
              className="p-2 text-xs font-mono uppercase bg-white/5 text-secondary hover:text-white hover:bg-white/10 transition-all rounded-sm"
              title="View Logs"
            >
              <Terminal size={16} />
            </button>
          )}

          {deployment.status === 'STOPPED' && (
              <button
                  onClick={handleStart}
                  disabled={isToggling}
                  className="p-2 text-xs font-mono uppercase bg-success/10 border border-success/30 text-success hover:bg-success/20 transition-all rounded-sm disabled:opacity-50"
                  title="Start"
              >
                  {isToggling ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/> : <Play size={16} />}
              </button>
          )}

          {deployment.status === 'RUNNING' && (
              <>
                <button
                    onClick={handleStop}
                    disabled={isToggling}
                    className="p-2 text-xs font-mono uppercase bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 transition-all rounded-sm disabled:opacity-50"
                    title="Stop"
                >
                    {isToggling ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/> : <Square size={16} fill="currentColor" />}
                </button>
                
                {deployment.exposedPort && (
                    <a
                    href={`http://localhost:${deployment.exposedPort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-xs font-mono uppercase bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all rounded-sm"
                    title="Launch App"
                    >
                    <ExternalLink size={16} />
                    </a>
                )}
              </>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deployment); }}
            disabled={isDeleting}
            className="p-2 text-xs font-mono uppercase text-dim hover:text-danger hover:bg-danger/10 transition-all rounded-sm"
            title="Terminate"
          >
            <Trash2 size={16} />
          </button>
      </div>
    </div>
  )
}

export default DeploymentItem
