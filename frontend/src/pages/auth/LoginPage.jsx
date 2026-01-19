import React from "react";
import { useAuth } from "../../context/AuthContext";
import clsx from 'clsx';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 gap-8">
      {/* Hero / Branding */}
      <div className="text-center space-y-2 animate-enter">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase font-mono">
            DocOps<span className="text-primary">.io</span>
        </h1>
        <p className="text-secondary font-mono text-xs md:text-sm tracking-widest uppercase">
            System Access Control
        </p>
      </div>

      {/* Login Panel */}
      <div className="w-full max-w-md animate-enter delay-100">
        <div className="glass-panel tech-border rounded-sm p-8 border-l-4 border-l-primary relative overflow-hidden">
             
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 p-2">
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-secondary rounded-full"></div>
                    <div className="w-1 h-1 bg-secondary rounded-full"></div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-mono font-bold text-primary tracking-widest uppercase flex items-center gap-2">
                    <span className="text-secondary opacity-50">&gt;</span> AUTHENTICATE
                </h2>
                <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent mt-4"></div>
            </div>

            <div className="space-y-6">
                <p className="text-dim font-mono text-xs leading-relaxed uppercase">
                    // Identification required to access deployment command center.
                    <br/>
                    // Please authenticate via GitHub to proceed.
                </p>

                <button
                    onClick={login}
                    className={clsx(
                    'group w-full flex items-center justify-center gap-3 rounded-sm bg-primary/10 border border-primary px-4 py-4 text-sm font-mono font-bold uppercase text-primary tracking-wider transition-all',
                    'hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]',
                    'active:scale-[0.98]'
                    )}
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    <span>Login with GitHub</span>
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">&gt;</span>
                </button>
            </div>
            
            <div className="mt-8 text-center">
                 <div className="inline-flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                    <span className="text-[10px] uppercase font-mono text-dim tracking-widest">System Operational</span>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
