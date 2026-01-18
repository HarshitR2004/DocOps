import React, { useState } from "react";
import EnterRepo from "../components/auth/EnterRepo";
import DeploymentList from "../components/ui/DeploymentList";

import LogViewer from "../components/ui/LogViewer";

const HomePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);

  const handleDeploymentStart = (response) => {
    // Refresh the deployment list when a new deployment starts
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewLogs = (deploymentId) => {
    setSelectedDeploymentId(deploymentId);
  };

  const handleCloseLogs = () => {
    setSelectedDeploymentId(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8">
      {/* Deployment Form Section */}
      <div className="w-full max-w-2xl mb-8">
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
          <EnterRepo onDeploymentStart={handleDeploymentStart} />
        </div>
      </div>

      {/* Deployments List Section */}
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
          <DeploymentList 
            refreshTrigger={refreshTrigger} 
            onViewLogs={handleViewLogs}
          />
        </div>
      </div>

      {/* Log Viewer Modal */}
      {selectedDeploymentId && (
        <LogViewer 
          deploymentId={selectedDeploymentId} 
          onClose={handleCloseLogs} 
        />
      )}
    </div>
  );
};

export default HomePage;
