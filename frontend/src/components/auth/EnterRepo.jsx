import React, { useState } from 'react'
import { Field, Input, Button, Label } from '@headlessui/react'
import clsx from 'clsx'
import { deployService } from '../../services/deployService'

const EnterRepo = ({ onDeploymentStart }) => {
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
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

      // Call deploy service
      const response = await deployService.deployPublicRepo({
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || 'main'
      })

      setSuccess(`Deployment started! ID: ${response.deploymentId}`)
      
      // Notify parent component
      if (onDeploymentStart) {
        onDeploymentStart(response)
      }

      // Reset form
      setRepoUrl('')
      setBranch('main')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Enter Public Repository Link
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub Repository URL
          </Label>
          <Input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            disabled={loading}
            className={clsx(
              'mt-1 block w-full rounded-lg border-none bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm/6 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </Field>

        <Field>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Branch (optional)
          </Label>
          <Input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            disabled={loading}
            className={clsx(
              'mt-1 block w-full rounded-lg border-none bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm/6 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </Field>

        {error && (
          <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className={clsx(
            'flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10',
            'focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {loading ? 'Starting Deployment...' : 'Start Deployment'}
        </Button>
      </form>
    </div>
  )
}

export default EnterRepo