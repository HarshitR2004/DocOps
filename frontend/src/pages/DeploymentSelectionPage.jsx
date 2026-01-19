import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Github, Link as LinkIcon, ArrowRight } from "lucide-react";

const DeploymentSelectionPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12 relative">
      {/* Top Navigation */}
      <div className="w-full max-w-[1600px] flex justify-between items-center absolute top-6 px-6">
        <button
          onClick={() => navigate("/")}
          className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-mono text-dim uppercase tracking-wider"
        >
          <span>&lt;</span> RETURN_HOME
        </button>

        <button
          onClick={logout}
          className="text-xs font-mono text-dim hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group border border-transparent hover:border-primary/20 px-4 py-2 rounded-sm"
        >
          <span className="text-secondary opacity-50 font-bold group-hover:text-primary group-hover:opacity-100 transition-colors">
            Logout
          </span>
          <span className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            &gt;
          </span>
        </button>
      </div>

      {/* Hero / Header */}
      <div className="text-center space-y-2 animate-enter mt-12">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase font-mono">
          New<span className="text-primary">_Deployment</span>
        </h1>
        <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
          Select Source for Container Initialization
        </p>
      </div>

      {/* Selection Options */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter delay-100 mt-8">
        {/* Option 1: GitHub */}
        <div
          onClick={() => navigate("/new-deployment/github")}
          className="group relative h-64 glass-panel border border-white/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
        >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 p-4 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors duration-300">
                <Github size={48} className="text-dim group-hover:text-primary transition-colors duration-300" />
            </div>
            
            <div className="relative z-10 text-center space-y-2">
                <h3 className="text-xl font-bold font-mono text-secondary group-hover:text-white transition-colors">
                    IMPORT_FROM_GITHUB
                </h3>
                <p className="text-xs font-mono text-dim max-w-[200px] mx-auto">
                    Deploy directly from one of your authenticated repositories
                </p>
            </div>

            <ArrowRight className="absolute bottom-6 right-6 text-dim opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>

        {/* Option 2: Public URL */}
        <div
          onClick={() => navigate("/new-deployment/url")}
          className="group relative h-64 glass-panel border border-white/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
        >
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
             <div className="relative z-10 p-4 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors duration-300">
                <LinkIcon size={48} className="text-dim group-hover:text-primary transition-colors duration-300" />
            </div>
            
            <div className="relative z-10 text-center space-y-2">
                <h3 className="text-xl font-bold font-mono text-secondary group-hover:text-white transition-colors">
                    DEPLOY_PUBLIC_URL
                </h3>
                <p className="text-xs font-mono text-dim max-w-[200px] mx-auto">
                    Initialize a container from any public git repository URL
                </p>
            </div>

            <ArrowRight className="absolute bottom-6 right-6 text-dim opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};

export default DeploymentSelectionPage;
