import React from 'react'
import clsx from 'clsx'
import { getStatusColor, formatDate } from '../../utils/deploymentUtils'
import ContainerList from './ContainerList'

const DeploymentItem = ({ 
  deployment, 
  onDelete, 
  isDeleting, 
  onViewLogs,
  onRefresh
}) => {
  return (
    <div className="glass-panel tech-border p-5 rounded-md hover:bg-surface-hover transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-lg font-bold text-primary truncate font-mono tracking-tight">
              {deployment.repository?.name || 'Unknown Module'}
            </h4>
            <div className={clsx(
                'px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-sm',
                getStatusColor(deployment.status) // Assuming utility returns classes, might need adjustment if it returns colors
              )}>
              {deployment.status}
            </div>
          </div>
          
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-secondary">
            <div>
               <span className="text-dim block uppercase text-[10px] mb-1">Branch</span>
               <span className="text-text-primary">{deployment.branch}</span>
            </div>
            {deployment.exposedPort && (
                <div>
                    <span className="text-dim block uppercase text-[10px] mb-1">Port</span>
                    <span className="text-primary">{deployment.exposedPort}</span>
                </div>
            )}
             <div>
                <span className="text-dim block uppercase text-[10px] mb-1">Deployed</span>
                <span>{formatDate(deployment.createdAt)}</span>
             </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
           {(deployment.status === 'RUNNING' || deployment.status === 'BUILDING') && (
            <button
              onClick={() => onViewLogs(deployment.id, deployment.status === 'BUILDING' ? 'build' : 'runtime')}
              className="px-3 py-1.5 text-xs font-mono uppercase border border-secondary/30 text-secondary hover:border-primary hover:text-primary transition-all rounded-sm"
            >
              System Logs
            </button>
          )}

          {deployment.status === 'RUNNING' && deployment.exposedPort && (
            <a
              href={`http://localhost:${deployment.exposedPort}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-mono uppercase bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-all rounded-sm flex items-center gap-2"
            >
              <span>Launch</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
          )}
          
          <button
            onClick={() => onDelete(deployment)}
            disabled={isDeleting}
            className={clsx(
              'px-3 py-1.5 text-xs font-mono uppercase border border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-500 transition-all rounded-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isDeleting ? 'Terminating...' : 'Terminate'}
          </button>
        </div>
      </div>

      {deployment.repository?.cloneUrl && (
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <a
            href={deployment.repository.cloneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-dim hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Repository Link
          </a>
          <div className="text-[10px] font-mono text-dim uppercase tracking-widest">
            ID: {deployment.id}
          </div>
        </div>
      )}

      {deployment.containers && deployment.containers.length > 0 && (
         <div className="mt-4">
             <ContainerList 
                containers={deployment.containers} 
                onRefresh={onRefresh}
             />
         </div>
      )}
    </div>
  )
}

export default DeploymentItem
