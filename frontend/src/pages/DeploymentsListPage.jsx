import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeploymentList from "../components/ui/DeploymentList";
import { useAuth } from "../context/AuthContext";

const DeploymentsListPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [refreshTrigger] = useState(0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12 relative">
      {/* Top Navigation */}
       <div className="w-full max-w-[1600px] flex justify-between items-center absolute top-6 px-6">
            <button 
                onClick={() => navigate('/')} 
                className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-mono text-dim uppercase tracking-wider"
            >
                <span>&lt;</span> RETURN_HOME
            </button>

            <button 
            onClick={logout}
            className="text-xs font-mono text-dim hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group border border-transparent hover:border-primary/20 px-4 py-2 rounded-sm"
            >
                <span className="text-secondary opacity-50 font-bold group-hover:text-primary group-hover:opacity-100 transition-colors">Logout</span>
                <span className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&gt;</span>
            </button>
      </div>

      {/* Hero / Header */}
      <div className="text-center space-y-2 animate-enter mt-12">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase font-mono">
                Active<span className="text-primary">_Operations</span>
            </h1>
            <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
                Monitor Running Containers
            </p>
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

export default DeploymentsListPage;
