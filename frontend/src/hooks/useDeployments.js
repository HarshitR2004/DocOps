import { useState, useEffect, useCallback } from 'react'
import { deployService } from '../services/deployService'

/**
 * Custom hook for managing deployment operations
 * @returns {Object} Deployment state and operations
 */
export const useDeployments = () => {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDeployments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await deployService.listDeployments()
      setDeployments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  return {
    deployments,
    loading,
    error,
    refetch: fetchDeployments,
  }
}

/**
 * Custom hook for managing a single deployment
 * @param {string} deploymentId - The deployment ID to fetch
 * @returns {Object} Deployment details state and operations
 */
export const useDeployment = (deploymentId) => {
  const [deployment, setDeployment] = useState(null)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    fetchDeployment()
  }, [fetchDeployment])

  return {
    deployment,
    loading,
    error,
    refetch: fetchDeployment,
  }
}

/**
 * Custom hook for deploying a repository
 * @returns {Object} Deploy function and state
 */
export const useDeployRepo = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const deploy = useCallback(async (repoUrl, branch = 'main') => {
    try {
      setLoading(true)
      setError(null)
      setData(null)
      
      const response = await deployService.deployPublicRepo({
        repoUrl,
        branch,
      })
      
      setData(response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return {
    deploy,
    loading,
    error,
    data,
    reset,
  }
}
