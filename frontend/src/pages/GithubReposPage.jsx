import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GithubService from "../services/github.service";
import { Github, Folder, Star, GitBranch, ArrowRight, Loader2 } from "lucide-react";

const GithubReposPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await GithubService.getRepos();
        setRepos(data);
      } catch (err) {
        setError("Failed to load repositories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleSelectRepo = (repo) => {
      navigate('/new-deployment/url', { state: { repoUrl: repo.html_url } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 gap-12 relative">
      {/* Top Navigation */}
      <div className="w-full max-w-[1600px] flex justify-between items-center absolute top-6 px-6">
        <button
          onClick={() => navigate("/new-deployment")}
          className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-mono text-dim uppercase tracking-wider"
        >
          <span>&lt;</span> BACK_TO_SELECTION
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
                Github<span className="text-primary">_Repositories</span>
            </h1>
            <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
                Select a Repository to Deploy
            </p>
      </div>


      {/* Content Area */}
      <div className="w-full max-w-4xl animate-enter delay-100">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={40} className="text-primary animate-spin" />
                <span className="text-dim font-mono text-sm tracking-widest">FETCHING_REPOSITORIES...</span>
             </div>
        ) : error ? (
            <div className="p-4 border border-danger/50 bg-danger/5 rounded-sm text-center">
                 <p className="text-danger font-mono mb-4">{error}</p>
                 <button onClick={() => window.location.reload()} className="text-xs font-mono text-white underline hover:text-primary">RETRY</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {repos.map((repo) => (
                    <div 
                        key={repo.id} 
                        onClick={() => handleSelectRepo(repo)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 glass-panel border border-white/5 hover:border-primary/50 transition-all cursor-pointer hover:bg-white/5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors">
                                <Folder size={20} className="text-dim group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-mono text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                    {repo.name}
                                    {repo.private && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-dim">PRIVATE</span>}
                                </h3>
                                <p className="text-sm text-dim font-mono mt-1 line-clamp-1 max-w-md">
                                    {repo.description || "No description provided"}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-xs font-mono text-secondary">
                                    <span className="flex items-center gap-1">
                                        <GitBranch size={12} />
                                        {repo.default_branch}
                                    </span>
                                    {repo.language && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                                            {repo.language}
                                        </span>
                                    )}
                                     <span className="flex items-center gap-1 text-dim">
                                        <Star size={12} />
                                        {repo.stargazers_count}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-dim group-hover:text-primary transition-colors pr-4">
                            <span className="text-xs font-mono font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                            <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </div>
                ))}

                {repos.length === 0 && (
                     <div className="text-center py-20 border border-dashed border-white/10 rounded-sm">
                        <p className="text-dim font-mono">NO_REPOSITORIES_FOUND</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GithubReposPage;
