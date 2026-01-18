import React, { useEffect, useRef, useState } from "react";
import { socketService } from "../../services/socket";

const LogViewer = ({ deploymentId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Clear previous logs when opening new deployment
    setLogs([]);
    
    // Subscribe to logs
    socketService.subscribeToLogs(deploymentId, (logLine) => {
      setLogs((prev) => [...prev, logLine]);
    });

    return () => {
      socketService.unsubscribeFromLogs();
    };
  }, [deploymentId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-mono font-semibold text-gray-200">
            Deployment Logs
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
        </div>

        {/* Log Content */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-black text-green-400">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
