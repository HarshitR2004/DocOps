import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12 relative">
      <div className="absolute top-6 right-6">
        <button 
          onClick={logout}
          className="text-xs font-mono text-dim hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group border border-transparent hover:border-primary/20 px-4 py-2 rounded-sm"
        >
          <span className="text-secondary opacity-50 font-bold group-hover:text-primary group-hover:opacity-100 transition-colors">Logout</span>
           <span className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&gt;</span>
        </button>
      </div>
      {/* Hero / Header */}
      <div className="text-center space-y-2 animate-enter">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase font-mono">
                DocOps<span className="text-primary">.io</span>
            </h1>
            <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
                Autonomous Container Deployment System
            </p>
      </div>

      {/* Navigation Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter delay-100 mt-8">
          
          {/* New Deployment Button */}
          <button 
            onClick={() => navigate('/new-deployment')}
            className="group relative flex flex-col items-start gap-4 p-8 glass-panel tech-border rounded-sm hover:bg-white/5 transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
               <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
            </div>
            
            <div className="space-y-1">
                <h2 className="text-xl font-mono font-bold text-primary tracking-widest uppercase">
                    Initialize_Deployment
                </h2>
                <div className="h-px w-12 bg-primary/50 group-hover:w-full transition-all duration-500"></div>
            </div>
            
            <p className="text-dim text-sm font-mono leading-relaxed">
                // Configure and launch new container instances from public repositories.
            </p>

            <span className="text-xs font-mono text-secondary group-hover:text-primary transition-colors mt-auto pt-4 flex items-center gap-2">
                EXECUTE_SEQUENCE <span className="translate-x-0 group-hover:translate-x-2 transition-transform">&gt;</span>
            </span>
          </button>


          {/* View Deployments Button */}
          <button 
            onClick={() => navigate('/deployments')}
            className="group relative flex flex-col items-start gap-4 p-8 glass-panel tech-border rounded-sm hover:bg-white/5 transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
               <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
               </svg>
            </div>
            
            <div className="space-y-1">
                <h2 className="text-xl font-mono font-bold text-success tracking-widest uppercase">
                    Active_Operations
                </h2>
                <div className="h-px w-12 bg-success/50 group-hover:w-full transition-all duration-500"></div>
            </div>
            
             <p className="text-dim text-sm font-mono leading-relaxed">
                // Monitor status, view logs, and manage lifecycle of running containers.
            </p>

            <span className="text-xs font-mono text-secondary group-hover:text-success transition-colors mt-auto pt-4 flex items-center gap-2">
                ACCESS_TERMINAL <span className="translate-x-0 group-hover:translate-x-2 transition-transform">&gt;</span>
            </span>
          </button>

      </div>
    </div>
  );
};

export default HomePage;
