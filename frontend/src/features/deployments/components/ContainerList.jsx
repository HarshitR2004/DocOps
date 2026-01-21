import React from 'react'
import ContainerItem from './ContainerItem'
import { useContainerActions } from '../../../hooks/useContainerActions'

const ContainerList = ({ containers, onRefresh }) => {
  const {
    actioningContainerId,
    actionType,
    error,
    handleStartContainer,
    handleStopContainer,
    handleDeleteContainer
  } = useContainerActions(onRefresh)

  if (!containers || containers.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h5 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Containers</h5>
      {error && (
        <div className="mb-2 p-2 text-xs text-red-700 bg-red-100 rounded dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {containers.map((container) => (
          <ContainerItem
            key={container.id}
            container={container}
            onStart={handleStartContainer}
            onStop={handleStopContainer}
            onDelete={handleDeleteContainer}
            actioningId={actioningContainerId}
            actionType={actionType}
          />
        ))}
      </div>
    </div>
  )
}

export default ContainerList
