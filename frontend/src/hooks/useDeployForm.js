import { useState } from 'react'
import { deployService } from '../services/deployService'

export const useDeployForm = (onDeploymentStart) => {
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [port, setPort] = useState('3000')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

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

      if (!port) {
        throw new Error('Port is required')
      }

      // Call deploy service
      const response = await deployService.deployPublicRepo({
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || 'main',
        port: parseInt(port)
      })

      setSuccess(`Deployment started! ID: ${response.deploymentId}`)
      
      // Notify parent component
      if (onDeploymentStart) {
        onDeploymentStart(response)
      }

      // Reset form
      setRepoUrl('')
      setBranch('main')
      setPort('3000')
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
    port,
    setPort,
    loading,
    error,
    success,
    handleSubmit
  }
}
