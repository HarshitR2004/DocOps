import React, { useEffect, useRef, useState } from "react";
import { socketService } from "../../services/socket";
import clsx from "clsx";

const LogViewer = ({ deploymentId, onClose, logType = 'runtime', isModal = true }) => {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Clear previous logs when opening new deployment
    setLogs([]);
    
    // Subscribe to logs
    const handleLog = (logLine) => {
      setLogs((prev) => [...prev, logLine]);
    };

    if (logType === 'build') {
      socketService.subscribeToBuildLogs(deploymentId, handleLog);
    } else {
      socketService.subscribeToLogs(deploymentId, handleLog);
    }

    return () => {
      socketService.unsubscribeFromLogs();
    };
  }, [deploymentId, logType]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const content = (
    <div className={clsx(
      "flex flex-col overflow-hidden bg-void border border-primary/20 shadow-2xl relative",
      isModal ? "w-full max-w-4xl h-[80vh] m-4 rounded-md" : "w-full h-full min-h-[500px] rounded-none border-0"
    )}>
       {/* Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-primary/20 shrink-0 z-20">
        <h3 className="text-sm font-mono font-bold text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          {logType === 'build' ? 'BUILD_LOGS' : 'SYSTEM_RUNTIME'}
        </h3>
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

      {/* Log Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-void text-primary/80 z-20 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-secondary/50 italic animate-pulse">Initializing log stream connection...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap break-all border-l-2 border-transparent hover:border-primary/30 hover:bg-surface pl-2 transition-colors">
              <span className="text-dim mr-2 select-none">${index + 1}</span>
              {log}
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
