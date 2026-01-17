import React from 'react'
import { Field, Input, Button  } from '@headlessui/react'
import clsx from 'clsx'

const EnterRepo = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Enter Public Repository Link</h2>
      </div>
      <Field>
        <Input
          placeholder="GitHub Repositiry Link"
          className={clsx(
            'mt-3 block w-full rounded-lg border-none bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm/6 text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
          )}
        />
      </Field>
       <Button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700">
      Start Deployment
    </Button>
    </div>
  )
}

export default EnterRepo