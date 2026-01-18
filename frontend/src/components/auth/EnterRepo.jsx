import React from 'react'
import { Field, Input, Button, Label } from '@headlessui/react'
import clsx from 'clsx'
import { useDeployForm } from '../../hooks/useDeployForm'
import { useNavigate } from 'react-router-dom'

const EnterRepo = ({ onDeploymentStart }) => {
  const navigate = useNavigate()
  const handleSuccess = (response) => {
    if (onDeploymentStart) onDeploymentStart(response)
    if (response?.deploymentId) {
      navigate(`/deployment/${response.deploymentId}`)
    }
  }

  const {
    repoUrl,
    setRepoUrl,
    branch,
    setBranch,
    loading,
    error,
    success,
    handleSubmit
  } = useDeployForm(handleSuccess)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel rounded-sm border-l-4 border-l-primary p-6 tech-border">
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-lg font-mono font-bold text-primary tracking-widest uppercase flex items-center gap-2">
            <span className="text-secondary opacity-50">&gt;</span> INITIALIZE_DEPLOYMENT
          </h2>
          <p className="text-xs text-secondary font-mono mt-1 ml-4">Enter public repository coordinates</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field className="group">
            <Label className="text-xs font-mono font-bold text-dim uppercase mb-1 block group-focus-within:text-primary transition-colors">
              // TARGET_REPOSITORY_URL
            </Label>
            <div className="relative flex items-center">
                <span className="absolute left-3 text-secondary font-mono text-sm">&gt;</span>
                <Input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
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
               // TARGET_BRANCH [OPTIONAL]
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
              'hover:bg-primary hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]',
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
                'EXECUTE_DEPLOYMENT_SEQUENCE'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default EnterRepo
