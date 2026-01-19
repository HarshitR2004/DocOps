import { useState } from 'react'
import { deployService } from '../services/deployService'

export const useDeployForm = (onDeploymentStart) => {
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  
  // Build Spec State
  const [language, setLanguage] = useState('detect') // 'node', 'python', 'detect'
  const [exposedPort, setExposedPort] = useState('3000')
  const [runtimeImage, setRuntimeImage] = useState('')
  const [buildCommand, setBuildCommand] = useState('')
  const [startCommand, setStartCommand] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // For Redeploy Mode
  const [isRedeploy, setIsRedeploy] = useState(false)
  const [deploymentId, setDeploymentId] = useState(null)

  const populateForm = (deployment) => {
      setIsRedeploy(true)
      setDeploymentId(deployment.id)
      setRepoUrl(deployment.repository.cloneUrl)
      setBranch(deployment.branch) // Assuming backend stores branch in deployment root now
      
      let buildSpec = {}
      try {
          buildSpec = JSON.parse(deployment.buildSpec || '{}')
      } catch (e) { console.error("Failed to parse buildSpec", e) }

      setLanguage(buildSpec.language || 'detect')
      setExposedPort(deployment.exposedPort || buildSpec.exposedPort || '3000')
      setRuntimeImage(buildSpec.runtimeImage || '')
      setBuildCommand(buildSpec.buildCommand || '')
      setStartCommand(buildSpec.startCommand || '')
  }

  const handleLanguageChange = (lang) => {
      setLanguage(lang)
      // Reset custom fields if switching back to detect or defaults
      if (lang === 'detect') {
          setRuntimeImage('')
          setBuildCommand('')
          setStartCommand('')
      }
      // Can add defaults here if needed, but backend handles defaults beautifully
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset states
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validate URL
      if (!repoUrl.trim()) {
        throw new Error('Repository URL is required')
      }

      // Basic GitHub URL validation
      if (!repoUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub repository URL')
      }

      if (!exposedPort) {
        throw new Error('Exposed Port is required')
      }

      const buildSpec = {
          language,
          exposedPort: parseInt(exposedPort),
          runtimeImage: runtimeImage || undefined,
          buildCommand: buildCommand || undefined,
          startCommand: startCommand || undefined
      }

      let response;
      if (isRedeploy && deploymentId) {
          response = await deployService.redeployDeployment(deploymentId, buildSpec)
          setSuccess(`Redeployment initiated! ID: ${response.deployment.id}`)
      } else {
          // Call deploy service
          response = await deployService.deployPublicRepo({
            repoUrl: repoUrl.trim(),
            branch: branch.trim() || 'main',
            buildSpec
          })
          setSuccess(`Deployment started! ID: ${response.deploymentId}`)
      }

      setSuccess(`Deployment started! ID: ${response.deploymentId}`)
      
      // Notify parent component
      // Notify parent component
      if (onDeploymentStart) {
        onDeploymentStart(response)
      }

      // Reset form ONLY if not redeploying (keep context if editing)
      if (!isRedeploy) {
        setRepoUrl('')
        setBranch('main')
        setExposedPort('3000')
        setLanguage('detect')
        setRuntimeImage('')
        setBuildCommand('')
        setStartCommand('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    repoUrl,
    setRepoUrl,
    branch,
    setBranch,
    language,
    handleLanguageChange,
    exposedPort,
    setExposedPort,
    runtimeImage,
    setRuntimeImage,
    buildCommand,
    setBuildCommand,
    startCommand,
    setStartCommand,
    populateForm,
    isRedeploy,
    loading,
    error,
    success,
    handleSubmit
  }
}
