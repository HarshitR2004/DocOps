import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { deployService } from '../../../features/deployments/services/deployService';

const CommitHistoryModal = ({ isOpen, onClose, deploymentId, onRollback }) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [commitToRollback, setCommitToRollback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      fetchHistory();
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setHistory([]);
        setError(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, deploymentId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deployService.getDeploymentHistory(deploymentId);
      setHistory(response.history || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch deployment history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackClick = (commitSha) => {
      setCommitToRollback(commitSha);
  };

  const executeRollback = async () => {
    if (!commitToRollback) return;
    
    setIsRollingBack(true);
    try {
        // Response contains the new deployment object
        const response = await deployService.rollbackDeployment(deploymentId, commitToRollback);
        
        // Immediate navigation to the new deployment for better UX
        if (response && response.id) {
            navigate(`/deployments/${response.id}`);
        }
        
        if (onRollback) {
          onRollback();
        }
        setCommitToRollback(null);
        onClose();
      } catch (err) {
        alert(`Rollback failed: ${err.message}`);
        console.error('Rollback error:', err);
      } finally {
        setIsRollingBack(false);
      }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      RUNNING: 'text-success',
      STOPPED: 'text-dim',
      FAILED: 'text-danger',
      BUILDING: 'text-warning',
      PENDING: 'text-warning'
    };
    return colors[status] || 'text-secondary';
  };

  if (!isOpen && !isAnimating) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isRollingBack ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className={`
        relative w-full max-w-2xl bg-surface border border-primary/20 p-6 
        shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all duration-200 max-h-[80vh] overflow-hidden flex flex-col
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-mono text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="text-primary">⟲</span> Deployment History
          </h3>
          <button
            onClick={onClose}
            disabled={isRollingBack}
            className="text-dim hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin text-primary text-3xl">⟳</div>
              <p className="text-sm font-mono text-dim mt-2">Loading history...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm font-mono text-danger">⚠ {error}</p>
              <button
                onClick={fetchHistory}
                className="mt-4 px-4 py-2 text-xs font-mono font-bold uppercase text-primary hover:text-white transition-colors border border-primary/20 hover:border-primary"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && history.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm font-mono text-dim">No deployment history available</p>
            </div>
          )}

          {!isLoading && !error && history.length > 0 && (
            <div className="space-y-3">
              {history.map((deployment, index) => (
                <div
                  key={deployment.id}
                  className={`
                    border p-4 transition-colors
                    ${deployment.isCurrent 
                      ? 'border-primary bg-primary/5' 
                      : 'border-primary/20 hover:border-primary/40'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Commit SHA */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-dim uppercase">Commit:</span>
                        <code className="text-sm font-mono text-primary font-bold">
                          {deployment.commitSha?.substring(0, 7) || 'UNKNOWN'}
                        </code>
                        {deployment.isCurrent && (
                          <span className="text-xs font-mono text-success uppercase px-2 py-0.5 border border-success/30 bg-success/10">
                            Current
                          </span>
                        )}
                      </div>

                      {/* Branch and Status */}
                      <div className="flex items-center gap-4 text-xs font-mono text-dim">
                        <span>Branch: <span className="text-secondary">{deployment.branch}</span></span>
                        <span>Status: <span className={getStatusColor(deployment.status)}>{deployment.status}</span></span>
                      </div>

                      {/* Date */}
                      <div className="text-xs font-mono text-dim mt-2">
                        Deployed: {formatDate(deployment.createdAt)}
                      </div>
                    </div>

                    {/* Rollback Button */}
                    {!deployment.isCurrent && deployment.commitSha !== 'UNKNOWN' && (
                      <button
                        onClick={() => handleRollbackClick(deployment.commitSha)}
                        disabled={isRollingBack}
                        className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-primary hover:text-white transition-colors border border-primary/20 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isRollingBack ? '...' : 'Rollback'}
                      </button>
                    )}
                  </div>

                  {/* Timeline connector */}
                  {index < history.length - 1 && (
                    <div className="flex justify-center mt-3">
                      <div className="w-px h-3 bg-primary/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between text-xs font-mono text-dim">
            <p>
              {history.length > 0 && (
                <span>Select a commit to rollback your deployment</span>
              )}
            </p>
            <button
              onClick={onClose}
              disabled={isRollingBack}
              className="px-4 py-2 text-xs font-mono font-bold uppercase text-dim hover:text-white transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={!!commitToRollback}
        onClose={() => setCommitToRollback(null)}
        onConfirm={executeRollback}
        title="Confirm Rollback"
        message={`Are you sure you want to rollback to commit ${commitToRollback ? commitToRollback.substring(0, 7) : ''}? This will create a new deployment.`}
        isLoading={isRollingBack}
        confirmText="Confirm_Rollback"
        processingText="Rolling_Back..."
      />
    </div>,
    document.body
  );
};

export default CommitHistoryModal;
