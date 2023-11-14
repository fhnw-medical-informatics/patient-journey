import { createListenerMiddleware } from '@reduxjs/toolkit'
import { addMessageAndRun, fetchMessages, updateRunStatus } from './assistantSlice'
import { openaiAPI } from '../utils/openai'
import { addAlerts } from '../alert/alertSlice'
import OpenAI from 'openai'
import { setIndexPatient } from '../data/dataSlice'

// Create the middleware instance and methods
export const assistantListenerMiddleware = createListenerMiddleware()

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
assistantListenerMiddleware.startListening({
  actionCreator: addMessageAndRun.fulfilled,
  effect: async (action, listenerApi) => {
    const runId = action.payload.runId
    const threadId = action.payload.threadId

    const executedActions = new Set<string>() // Keep track of which call_id's have been executed

    // Poll the run status until it's complete
    const intervalId = setInterval(async () => {
      console.log('Polling run status...')
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

          console.log('Run completed!')
          break
        case 'failed':
        case 'cancelled':
        case 'cancelling':
          // Stop polling
          clearInterval(intervalId)

          listenerApi.dispatch(
            addAlerts([
              {
                type: 'error',
                topic: 'Assistant Run',
                message: `Could not run thread. ${run.last_error?.message}`,
              },
            ])
          )
          listenerApi.dispatch(
            updateRunStatus({
              type: 'loading-failed',
              errorMessage: run.last_error?.message ?? 'Unknown error',
            })
          )
          break
        case 'requires_action':
          console.log('Run requires action!', run)
          runRequiredActions(threadId, runId, run, executedActions, listenerApi)
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

const runRequiredActions = async (
  threadId: string,
  runId: string,
  run: OpenAI.Beta.Threads.Run,
  alreadyExecutedActions: Set<string>,
  listenerApi: any
) => {
  if (
    run.status === 'requires_action' &&
    run.required_action &&
    run.required_action?.submit_tool_outputs.tool_calls.length > 0
  ) {
    const toolOutputs = []

    for (const call of run.required_action!.submit_tool_outputs.tool_calls) {
      if (!alreadyExecutedActions.has(call.id)) {
        // Execute the action
        console.log('Executing action', call)
        alreadyExecutedActions.add(call.id)

        // All possible actions have been defined in functions.json (which have been added to the assistant via openai's platform)
        switch (call.function.name) {
          case 'setIndexPatient':
            listenerApi.dispatch(setIndexPatient(JSON.parse(call.function.arguments).caseId))
            toolOutputs.push({
              tool_call_id: call.id,
              output: 'Index patient set',
            })
            break
          default:
            console.error('Unknown action', call.function.name)
            throw new Error(`Unknown action ${call.function.name}`)
        }
      } else {
        console.log('Action already executed', call.id)
      }
    }

    // Submit the action
    if (toolOutputs.length > 0) {
      console.log('Submitting tool outputs', toolOutputs)

      await openaiAPI.beta.threads.runs.submitToolOutputs(threadId, runId, {
        tool_outputs: toolOutputs,
      })
    }
  } else {
    console.error('Run status is not requires_action or doesnt have calls in it', run)
    throw new Error(`Run status is ${run.status} and not requires_action`)
  }
}
