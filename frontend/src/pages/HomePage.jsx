import React, { useState } from "react";
import EnterRepo from "../components/auth/EnterRepo";
import DeploymentList from "../components/ui/DeploymentList";

const HomePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDeploymentStart = () => {
    // Refresh the deployment list when a new deployment starts
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12">
      {/* Hero / Header */}
      <div className="text-center space-y-2 animate-enter">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase font-mono">
                DocOps<span className="text-primary">.io</span>
            </h1>
            <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
                Autonomous Container Deployment System
            </p>
      </div>

      {/* Deployment Form Section */}
      <div className="w-full max-w-3xl animate-enter delay-100">
          <EnterRepo onDeploymentStart={handleDeploymentStart} />
      </div>

      {/* Deployments List Section */}
      <div className="w-full max-w-5xl animate-enter delay-200">
          <DeploymentList 
            refreshTrigger={refreshTrigger} 
          />
      </div>
    </div>
  );
};

export default HomePage;
