import React from "react";
import { useNavigate } from "react-router-dom";
import EnterRepo from "../components/auth/EnterRepo";
import { useAuth } from "../context/AuthContext";

const DeployFromUrlPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDeploymentStart = (response) => {
    // Navigate to the deployment details or list after start if needed
    // But EnterRepo handles navigation to deployment details on success usually (based on previous code)
    // Checking EnterRepo code... it does navigate to `/deployment/${response.deploymentId}`
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12 relative">
       {/* Top Navigation */}
       <div className="w-full max-w-[1600px] flex justify-between items-center absolute top-6 px-6">
            <button 
                onClick={() => navigate('/new-deployment')} 
                className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-mono text-dim uppercase tracking-wider"
            >
                <span>&lt;</span> BACK_TO_SELECTION
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
                Initialize<span className="text-primary">_Deployment</span>
            </h1>
            <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
                Configure New Container Instance from Public URL
            </p>
      </div>

      {/* Deployment Form Section */}
      <div className="w-full max-w-3xl animate-enter delay-100">
          <EnterRepo onDeploymentStart={handleDeploymentStart} />
      </div>
    </div>
  );
};

export default DeployFromUrlPage;
