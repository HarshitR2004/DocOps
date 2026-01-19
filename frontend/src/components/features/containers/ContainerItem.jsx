import React from 'react'
import clsx from 'clsx'
import { getStatusColor } from '../../../utils/deploymentUtils'

const ContainerItem = ({ 
  container, 
  onStart, 
  onStop, 
  onDelete, 
  actioningId, 
  actionType 
}) => {
  const isActioning = actioningId === container.id

  return (
    <div className="flex items-center justify-between p-3 rounded-sm bg-surface border border-b-border/50 hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-primary/80">
            Container
          </span>
          <span
            className={clsx(
              'px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border',
              getStatusColor(container.status)
            )}
          >
            {container.status}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-secondary mt-1 font-mono">
          Port :: <span className="text-text-primary">{container.port}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {container.status === 'RUNNING' && (
          <button
            onClick={() => onStop(container.id)}
            disabled={isActioning}
            className={clsx(
              'p-1.5 rounded-sm transition-colors text-warning border border-warning/30 hover:bg-warning/10',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Stop Container"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
          </button>
        )}
        {container.status === 'STOPPED' && (
          <button
            onClick={() => onStart(container.id)}
            disabled={isActioning}
            className={clsx(
              'p-1.5 rounded-sm transition-colors text-success border border-success/30 hover:bg-success/10',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Start Container"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        )}
        <button
          onClick={() => onDelete(container.id)}
          disabled={isActioning}
          className={clsx(
            'p-1.5 rounded-sm transition-colors text-danger border border-danger/30 hover:bg-danger/10',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Delete Container"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  )
}

export default ContainerItem
