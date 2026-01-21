import { Select, Description, Transition, Field, Label, Input, Button } from '@headlessui/react'
import clsx from 'clsx'
import { useDeployForm } from '../hooks/useDeployForm'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, Fragment } from 'react'

const EnterRepo = ({ onDeploymentStart, initialDeployment }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleSuccess = (response) => {
    if (onDeploymentStart) onDeploymentStart(response)
    // If it's a redeploy, we might stay on the page or go back. 
    // Usually navigating to details is good.
    if (response?.deploymentId || response?.deployment?.id) {
       // Support both response formats (new vs update)
       const id = response.deploymentId || response.deployment.id
       navigate(`/deployment/${id}`)
    }
  }

  const {
    repoUrl, setRepoUrl,
    branch, setBranch,
    language, handleLanguageChange,
    exposedPort, setExposedPort,
    runtimeImage, setRuntimeImage,
    buildCommand, setBuildCommand,
    startCommand, setStartCommand,
    populateForm,
    isRedeploy,
    loading, error, success, handleSubmit
  } = useDeployForm(handleSuccess)

  useEffect(() => {
    if (initialDeployment) {
        populateForm(initialDeployment)
    } else if (location.state?.deployment) {
        populateForm(location.state.deployment)
    } else if (location.state?.repoUrl) {
        setRepoUrl(location.state.repoUrl)
    }
  }, [initialDeployment, location.state, setRepoUrl])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel rounded-sm border-l-4 border-l-primary p-6 tech-border">
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-lg font-mono font-bold text-primary tracking-widest uppercase flex items-center gap-2">
            <span className="text-secondary opacity-50">&gt;</span> {isRedeploy ? 'REDEPLOY_SYSTEM' : 'INITIALIZE_DEPLOYMENT'}
          </h2>
          <p className="text-xs text-secondary font-mono mt-1 ml-4">
            {isRedeploy ? 'Update configuration and restart' : 'Enter public repository coordinates'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field className="group">
                <Label className="text-xs font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                  // REPO_URL
                </Label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-secondary font-mono text-sm">&gt;</span>
                    <Input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    disabled={loading || isRedeploy} // Disable repo change on redeploy usually
                    className={clsx(
                        'block w-full rounded-sm bg-black/50 border border-border pl-8 pr-3 py-3 text-sm font-mono text-text-primary placeholder:text-dim',
                        'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    />
                </div>
              </Field>

              <Field className="group">
                <Label className="text-xs font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                  // EXPOSED_PORT
                </Label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-secondary font-mono text-sm">:</span>
                    <Input
                    type="number"
                    value={exposedPort}
                    onChange={(e) => setExposedPort(e.target.value)}
                    placeholder="3000"
                    disabled={loading}
                    className={clsx(
                        'block w-full rounded-sm bg-black/50 border border-border pl-8 pr-3 py-3 text-sm font-mono text-text-primary placeholder:text-dim',
                        'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    />
                </div>
              </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field className="group">
                <Label className="text-xs font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                  // BRANCH
                </Label>
                <div className="relative flex items-center">
                    <span className="absolute left-3 text-secondary font-mono text-sm">#</span>
                    <Input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    disabled={loading}
                    className={clsx(
                        'block w-full rounded-sm bg-black/50 border border-border pl-8 pr-3 py-3 text-sm font-mono text-text-primary placeholder:text-dim',
                        'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    />
                </div>
              </Field>

              <Field className="group">
                 <Label className="text-xs font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                  // PROJECT_TYPE
                </Label>
                <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={loading}
                        className={clsx(
                            'block w-full rounded-sm bg-black/50 border border-border pl-3 pr-8 py-3 text-sm font-mono text-text-primary appearance-none cursor-pointer',
                            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <option value="detect">AUTO_DETECT</option>
                        <option value="node">NODE_JS</option>
                        <option value="python">PYTHON</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-secondary">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                </div>
              </Field>
          </div>

          {/* Advanced Configuration Section */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <h3 className="text-xs font-bold text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="text-secondary opacity-50">+</span> ADVANCED_CONFIGURATION
            </h3>
            
            <div className="space-y-4 pl-4 border-l border-white/5">
                 <Field className="group">
                    <Label className="text-[10px] font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                    RUNTIME_IMAGE {language === 'detect' && '(OPTIONAL / AUTO)'}
                    </Label>
                    <Input
                        type="text"
                        value={runtimeImage}
                        onChange={(e) => setRuntimeImage(e.target.value)}
                        placeholder={language === 'node' ? 'node:18' : language === 'python' ? 'python:3.9' : 'Auto'}
                        disabled={loading}
                        className="block w-full rounded-sm bg-black/30 border border-border px-3 py-2 text-xs font-mono text-text-primary placeholder:text-dim/50 focus:outline-none focus:border-primary transition-all"
                    />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field className="group">
                        <Label className="text-[10px] font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                        BUILD_COMMAND {language === 'detect' && '(OPTIONAL / AUTO)'}
                        </Label>
                        <Input
                            type="text"
                            value={buildCommand}
                            onChange={(e) => setBuildCommand(e.target.value)}
                            placeholder={language === 'node' ? 'npm install' : 'pip install -r requirements.txt'}
                            disabled={loading}
                             className="block w-full rounded-sm bg-black/30 border border-border px-3 py-2 text-xs font-mono text-text-primary placeholder:text-dim/50 focus:outline-none focus:border-primary transition-all"
                        />
                    </Field>
                    <Field className="group">
                        <Label className="text-[10px] font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
                        START_COMMAND {language === 'detect' && '(OPTIONAL / AUTO)'}
                        </Label>
                        <Input
                            type="text"
                            value={startCommand}
                            onChange={(e) => setStartCommand(e.target.value)}
                            placeholder={language === 'node' ? 'npm start' : 'python app.py'}
                            disabled={loading}
                             className="block w-full rounded-sm bg-black/30 border border-border px-3 py-2 text-xs font-mono text-text-primary placeholder:text-dim/50 focus:outline-none focus:border-primary transition-all"
                        />
                    </Field>
                </div>
            </div>
          </div>

          {error && (
            <div className="p-3 border-l-2 border-danger bg-danger/5 text-danger font-mono text-xs">
              <span className="font-bold">ERROR::</span> {error}
            </div>
          )}

          {success && (
            <div className="p-3 border-l-2 border-success bg-success/5 text-success font-mono text-xs">
               <span className="font-bold">SUCCESS::</span> {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={clsx(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary/10 border border-primary px-4 py-3 text-sm font-mono font-bold uppercase text-primary tracking-wider transition-all',
              'hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-primary/10 disabled:hover:text-primary'
            )}
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></span> 
                    INITIATING_SEQUENCE...
                </span>
            ) : (
                isRedeploy ? 'CONFIRM_REDEPLOYMENT' : 'EXECUTE_DEPLOYMENT_SEQUENCE'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default EnterRepo
