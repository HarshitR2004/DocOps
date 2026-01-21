import React, { useEffect, useRef, useState } from "react";
import { socketService } from "../../services/socket";
import { deployService } from "../../services/deployService";
import clsx from "clsx";

import { getStatusColor } from "../../utils/deploymentUtils";

const StatusToggle = ({ deploymentId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const dep = await deployService.getDeploymentById(deploymentId);
            setStatus(dep.status);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchStatus();
    }, [deploymentId]);

    const handleToggle = async () => {
        if (!status) return;
        setLoading(true);
        try {
            if (status === 'RUNNING') {
                await deployService.stopDeployment(deploymentId);
                setStatus('STOPPED');
            } else if (status === 'STOPPED') {
                await deployService.startDeployment(deploymentId);
                setStatus('RUNNING');
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!status) return null;

    const isRunning = status === 'RUNNING';
    const canToggle = status === 'RUNNING' || status === 'STOPPED';

    return (
        <div className="flex items-center gap-3">


            {canToggle && (
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={clsx(
                        "px-3 py-1 text-xs font-mono uppercase border transition-all rounded-sm flex items-center gap-2",
                        isRunning 
                            ? "bg-warning/10 border-warning text-warning hover:bg-warning/20" 
                            : "bg-success/10 border-success text-success hover:bg-success/20",
                        "disabled:opacity-50"
                    )}
                >
                    {loading ? 'Processing...' : (isRunning ? 'Stop' : 'Start')}
                    {!loading && (
                        isRunning 
                        ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </button>
            )}
        </div>
    );
};

const LogViewer = ({ deploymentId, onClose, logType = 'runtime', isModal = true }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'build', 'runtime', 'all'
  const [buildLogs, setBuildLogs] = useState([]);
  const [runtimeLogs, setRuntimeLogs] = useState([]);
  const logsEndRef = useRef(null);
  
  // Initialize tab based on prop/status preference could be added here
  useEffect(() => {
      if (logType === 'build') setActiveTab('build');
  }, [logType]);


  useEffect(() => {
    // 1. Initial Fetch of persistent logs
    const fetchLogs = async () => {
        try {
            const data = await deployService.getDeploymentLogs(deploymentId, 'all');
            
            if (data.buildLogs) {
                setBuildLogs(data.buildLogs.split('\n').filter(Boolean));
            }
            if (data.runtimeLogs) {
                setRuntimeLogs(data.runtimeLogs.split('\n').filter(Boolean));
            }
        } catch (e) {
            console.error("Failed to fetch historical logs", e);
        }
    };
    fetchLogs();

    // 2. Subscribe to buffers
    const handleBuildLog = (log) => {
        setBuildLogs(prev => [...prev, log]);
    };
    const handleRuntimeLog = (log) => {
         setRuntimeLogs(prev => [...prev, log]);
    };

    socketService.subscribeToBuildLogs(deploymentId, handleBuildLog);
    socketService.subscribeToLogs(deploymentId, handleRuntimeLog);

    return () => {
      socketService.unsubscribeFromLogs();
    };
  }, [deploymentId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [buildLogs, runtimeLogs, activeTab]);

  const getVisibleLogs = () => {
      if (activeTab === 'build') return buildLogs.map(l => ({ type: 'build', content: l }));
      if (activeTab === 'runtime') return runtimeLogs.map(l => ({ type: 'runtime', content: l }));
      
      // Merge for 'all' - simplistic time-based merging isn't possible without timestamps in log lines
      // So we just duplicate lists. Ideally, we'd have timestamps.
      // For now, we'll display Build then Runtime.
      return [
          ...buildLogs.map(l => ({ type: 'build', content: l })),
          ...runtimeLogs.map(l => ({ type: 'runtime', content: l }))
      ];
  };

  const visibleLogs = getVisibleLogs();

  const content = (
    <div className={clsx(
      "flex flex-col overflow-hidden bg-void border border-primary/20 shadow-2xl relative",
      isModal ? "w-full max-w-4xl h-[80vh] m-4 rounded-md" : "w-full h-full min-h-[500px] rounded-none border-0"
    )}>
       {/* Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

      {/* Header & Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-primary/20 shrink-0 z-20">
         <div className="flex gap-4 items-center">
             {['all', 'build', 'runtime'].map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                        "text-xs font-mono font-bold uppercase tracking-wider px-2 py-1 transition-colors border-b-2",
                        activeTab === tab 
                            ? "text-primary border-primary" 
                            : "text-dim border-transparent hover:text-text-primary"
                    )}
                 >
                     {tab}
                 </button>
             ))}
         </div>

         {/* Right Side Controls */}
         <div className="flex items-center gap-4">
             {/* Status Toggle Button will go here once we have status */}
             <StatusToggle deploymentId={deploymentId} />
             
             {isModal && (
               <button
                 onClick={onClose}
                 className="text-secondary hover:text-primary transition-colors hover:rotate-90 transform duration-300"
               >
                 <svg
                   xmlns="http://www.w3.org/2000/svg"
                   className="h-5 w-5"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M6 18L18 6M6 6l12 12"
                   />
                 </svg>
               </button>
             )}
         </div>
      </div>

      {/* Log Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-void z-20 scrollbar-thin">
        {visibleLogs.length === 0 ? (
          <div className="text-secondary/50 italic animate-pulse">Building...</div>
        ) : (
            visibleLogs.map((log, index) => (
            <div 
                key={index} 
                className={clsx(
                    "whitespace-pre-wrap break-all border-l-2 pl-2 transition-colors mb-0.5",
                    log.type === 'build' ? "text-primary/70 border-primary/20" : "text-success/80 border-success/20",
                    "hover:bg-white/5"
                )}
            >
              <span className="text-dim mr-2 select-none text-[10px] uppercase">[{log.type}]</span>
              {log.content}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );

  if (!isModal) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-enter">
      {content}
    </div>
  );
};

export default LogViewer;
