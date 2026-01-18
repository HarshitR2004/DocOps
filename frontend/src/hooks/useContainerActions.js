import { useState } from 'react'
import { containerService } from '../services/containerService'

export const useContainerActions = (onSuccess) => {
  const [actioningContainerId, setActioningContainerId] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [error, setError] = useState(null)

  const handleStartContainer = async (containerId) => {
    try {
      setActioningContainerId(containerId)
      setActionType('start')
      setError(null)
      await containerService.startContainer(containerId)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  const handleStopContainer = async (containerId) => {
    try {
      setActioningContainerId(containerId)
      setActionType('stop')
      setError(null)
      await containerService.stopContainer(containerId)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  const handleDeleteContainer = async (containerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this container? This cannot be undone."
    )
    if (!confirmed) return

    try {
      setActioningContainerId(containerId)
      setActionType('delete')
      setError(null)
      await containerService.deleteContainer(containerId)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningContainerId(null)
      setActionType(null)
    }
  }

  return {
    actioningContainerId,
    actionType,
    error,
    handleStartContainer,
    handleStopContainer,
    handleDeleteContainer
  }
}
