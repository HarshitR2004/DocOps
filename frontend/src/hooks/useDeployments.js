import { useState, useCallback } from 'react'
import { deployService } from '../services/deployService'
import { containerService } from '../services/containerService'

export const useDeployments = () => {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

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

  const deleteDeployment = async (deployment) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deployment and its container(s)? This cannot be undone."
    )
    if (!confirmed) return

    try {
      setDeletingId(deployment.id)
      setError(null)

      if (deployment.containers && deployment.containers.length > 0) {
        for (const container of deployment.containers) {
          await containerService.deleteContainer(container.id)
        }
      }

      await deployService.deleteDeployment(deployment.id)
      setDeployments((prev) => prev.filter((d) => d.id !== deployment.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return {
    deployments,
    loading,
    error,
    deletingId,
    fetchDeployments,
    deleteDeployment
  }
}
