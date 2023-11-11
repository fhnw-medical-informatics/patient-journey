import { createListenerMiddleware } from '@reduxjs/toolkit'
import { addMessageAndRun, fetchMessages, updateRunStatus } from './assistantSlice'
import { openaiAPI } from '../utils/openai'

// Create the middleware instance and methods
export const assistantListenerMiddleware = createListenerMiddleware()

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
assistantListenerMiddleware.startListening({
  actionCreator: addMessageAndRun.fulfilled,
  effect: async (action, listenerApi) => {
    const runId = action.payload.runId
    const threadId = action.payload.threadId

    // Poll the run status until it's complete
    const intervalId = setInterval(async () => {
      const run = await openaiAPI.beta.threads.runs.retrieve(threadId, runId)

      switch (run.status) {
        case 'completed':
          // Stop polling
          clearInterval(intervalId)
          // Update the run status
          listenerApi.dispatch(
            updateRunStatus({
              type: 'loading-complete',
              status: 'completed',
            })
          )
          // Fetch the messages
          listenerApi.dispatch(fetchMessages())
          break
        case 'failed':
        case 'cancelled':
        case 'cancelling':
          listenerApi.dispatch(
            updateRunStatus({
              type: 'loading-failed',
              errorMessage: run.last_error?.message ?? 'Unknown error',
            })
          )
          break
        default:
          listenerApi.dispatch(
            updateRunStatus({
              type: 'loading-in-progress',
            })
          )
      }
    }, 1000)
  },
})
