import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeploymentList from "../components/DeploymentList";
import { useAuth } from "../../../context/AuthContext";
import { useDeployments } from "../hooks/useDeployments";
import { Activity, Server, AlertCircle } from "lucide-react";

const DeploymentsListPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { deployments, loading, fetchDeployments } = useDeployments();

  // Metrics Calculation
  const totalDeployments = deployments.length;
  const activeDeployments = deployments.filter(d => d.status === 'RUNNING' || d.status === 'BUILDING').length;
  const failedDeployments = deployments.filter(d => d.status === 'FAILED' || d.status === 'STOPPED').length;

  useEffect(() => {
    fetchDeployments();
  }, [refreshTrigger, fetchDeployments]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 gap-8 relative bg-black/90">
      {/* Top Navigation */}
       <div className="w-full max-w-[1600px] flex justify-between items-center px-6 border-b border-white/10 pb-4">
            <button 
                onClick={() => navigate('/')} 
                className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-mono text-dim uppercase tracking-wider"
            >
                <span>&lt;</span> RETURN_HOME
            </button>

            <h1 className="text-xl font-bold font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Create &<span className="text-primary">_Manage</span>
            </h1>

            <button 
            onClick={logout}
            className="text-xs font-mono text-dim hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group border border-transparent hover:border-primary/20 px-4 py-2 rounded-sm"
            >
                <span className="text-secondary opacity-50 font-bold group-hover:text-primary group-hover:opacity-100 transition-colors">Logout</span>
                <span className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&gt;</span>
            </button>
      </div>

      <div className="w-full max-w-[1600px] space-y-8 animate-enter">
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 border-l-4 border-l-primary flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div>
                      <p className="text-xs font-mono text-secondary uppercase tracking-widest mb-1">Total Operations</p>
                      <h2 className="text-3xl font-black text-white font-mono">{loading ? '-' : totalDeployments}</h2>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                      <Server size={24} />
                  </div>
              </div>

              <div className="glass-panel p-6 border-l-4 border-l-success flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div>
                      <p className="text-xs font-mono text-secondary uppercase tracking-widest mb-1">Active Systems</p>
                      <h2 className="text-3xl font-black text-success font-mono">{loading ? '-' : activeDeployments}</h2>
                  </div>
                  <div className="p-3 bg-success/10 rounded-full text-success group-hover:scale-110 transition-transform">
                      <Activity size={24} />
                  </div>
              </div>

              <div className="glass-panel p-6 border-l-4 border-l-danger flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div>
                      <p className="text-xs font-mono text-secondary uppercase tracking-widest mb-1">Inactive / Failed</p>
                      <h2 className="text-3xl font-black text-danger font-mono">{loading ? '-' : failedDeployments}</h2>
                  </div>
                  <div className="p-3 bg-danger/10 rounded-full text-danger group-hover:scale-110 transition-transform">
                      <AlertCircle size={24} />
                  </div>
              </div>
          </div>

          {/* Deployments List Section */}
          <div className="w-full">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    Recent Deployments
                  </h3>
                  <button 
                    onClick={() => navigate('/new-deployment')}
                    className="px-4 py-2 bg-primary/10 border border-primary text-primary text-xs font-mono uppercase font-bold hover:bg-primary/20 transition-all rounded-sm flex items-center gap-2"
                  >
                    + Initialize New
                  </button>
               </div>
               
              <DeploymentList 
                deployments={deployments}
                loading={loading}
                onRefresh={fetchDeployments}
              />
          </div>
      </div>
    </div>
  );
};

export default DeploymentsListPage;
