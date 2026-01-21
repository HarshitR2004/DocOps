import { useState, useCallback } from 'react'
import { deployService } from '../services/deployService'

export const useDeployment = (deploymentId) => {
  const [deployment, setDeployment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDeployment = useCallback(async () => {
    if (!deploymentId) return

    try {
      setLoading(true)
      setError(null)
      const data = await deployService.getDeploymentById(deploymentId)
      setDeployment(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  return {
    deployment,
    loading,
    error,
    fetchDeployment
  }
}
