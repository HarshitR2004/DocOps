import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import EnterRepo from './EnterRepo'
import { deployService } from '../services/deployService'

const RedeployModal = ({ isOpen, onClose, deploymentId, onRedeploySuccess }) => {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen && deploymentId) {
            setLoading(true)
            deployService.getDeploymentConfig(deploymentId)
                .then(data => {
                    // backend returns { deploymentConfig: { ... } }
                    // checking controller: res.json({ deploymentConfig });
                    setConfig(data.deploymentConfig)
                    setLoading(false)
                })
                .catch(err => {
                    console.error("Failed to fetch config:", err)
                    setError("Failed to load configuration.")
                    setLoading(false)
                })
        }
    }, [isOpen, deploymentId])

    const handleSuccess = (response) => {
        if (onRedeploySuccess) onRedeploySuccess(response)
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-sm bg-background p-1 text-left align-middle shadow-xl transition-all border border-white/10 tech-border">
                                <div className="bg-black/80 p-6 relative">
                                    <button 
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-dim hover:text-primary transition-colors font-mono text-xl"
                                    >
                                        &times;
                                    </button>

                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-mono font-bold leading-6 text-primary mb-6 uppercase tracking-widest border-b border-white/10 pb-4"
                                    >
                                        // RECONFIGURE_DEPLOYMENT
                                    </Dialog.Title>
                                    
                                    {loading && (
                                        <div className="text-center py-12 font-mono text-dim animate-pulse">
                                            LOADING_CONFIGURATION...
                                        </div>
                                    )}

                                    {error && (
                                         <div className="text-center py-12 font-mono text-danger">
                                            ERROR: {error}
                                        </div>
                                    )}

                                    {!loading && !error && config && (
                                        <EnterRepo 
                                            initialDeployment={{
                                                ...config,
                                                id: deploymentId, // Pass ID for isRedeploy check if needed, though usually handled by useDeployForm logic
                                                deploymentId: deploymentId // explicitly just in case
                                                // Actually EnterRepo checks `initialDeployment` to populate form.
                                                // And `useDeployForm` checks `isRedeploy` based on if `id` exists or we explicitly say it.
                                                // Let's pass the ID so `useDeployForm` knows it's an update.
                                            }}
                                            onDeploymentStart={handleSuccess}
                                        />
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default RedeployModal
