import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import OpenAI from 'openai'
import { assistantGPT } from './assistantGPT'
import { openaiAPI } from '../utils/openai'
import { DataLoadingComplete, DataLoadingFailed, DataLoadingInProgress, DataLoadingPending } from '../data/types'
import { Patient } from '../data/patients'
import { DataState } from '../data/dataSlice'
import { TOKENS_PER_CHUNK_PROMPT, createPatientJourneysChunks, preparePatientJourneys } from '../data/embeddings'
import { MessageCreateParams } from 'openai/resources/beta/threads/messages/messages'
import { addAlerts } from '../alert/alertSlice'

let thread: OpenAI.Beta.Thread

interface AssistantState {
  thread: DataLoadingPending | DataLoadingInProgress | DataLoadingFailed | DataLoadingComplete<{ threadId: string }>
  run:
    | DataLoadingPending
    | DataLoadingInProgress
    | DataLoadingFailed
    | DataLoadingComplete<{
        runId: string
        status: DataLoadingInProgress | DataLoadingFailed | DataLoadingComplete<{ status: 'completed' }>
      }>
  messages:
    | DataLoadingPending
    | (DataLoadingInProgress & { messages: OpenAI.Beta.Threads.Messages.ThreadMessage[] })
    | DataLoadingFailed
    | DataLoadingComplete<{
        messages: OpenAI.Beta.Threads.Messages.ThreadMessage[]
      }>
}

const initialState: AssistantState = {
  thread: { type: 'loading-pending' },
  run: { type: 'loading-pending' },
  messages: { type: 'loading-pending' },
}

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    // TODO: Middleware to update the run status periodically until completed
    // when completed, fetch the messages again
    updateRunStatus: (
      state,
      action: PayloadAction<DataLoadingInProgress | DataLoadingFailed | DataLoadingComplete<{ status: 'completed' }>>
    ) => {
      console.log('Updating run status: ', action.payload)
      if (state.run.type === 'loading-complete') {
        state.run.status = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createNewThread.pending, (state) => {
      state.thread = { type: 'loading-in-progress' }
    })
    builder.addCase(createNewThread.fulfilled, (state, action) => {
      state.thread = { type: 'loading-complete', threadId: action.payload }
      state.messages = { type: 'loading-pending' }
    })
    builder.addCase(createNewThread.rejected, (state, action) => {
      state.thread = { type: 'loading-failed', errorMessage: action.error.message ?? 'Unknown error' }
    })
    builder.addCase(addMessageAndRun.pending, (state) => {
      console.log('Adding message and running thread PENDING!...')
      state.run = { type: 'loading-in-progress' }
    })
    builder.addCase(addMessageAndRun.fulfilled, (state, action) => {
      state.run = { type: 'loading-complete', runId: action.payload.runId, status: { type: 'loading-in-progress' } }
      state.messages = {
        type: 'loading-complete',
        messages: [
          ...action.payload.newMessages.map((m) => {
            const message: OpenAI.Beta.Threads.Messages.ThreadMessage = {
              id: '',
              object: 'thread.message',
              created_at: new Date().getTime(),
              thread_id: '',
              role: m.role,
              content: [
                {
                  type: 'text',
                  text: {
                    value: m.content,
                    annotations: [],
                  },
                },
              ],
              file_ids: [],
              assistant_id: null,
              run_id: null,
              metadata: m.metadata,
            }

            return message
          }),
          ...(state.messages.type === 'loading-complete' ? state.messages.messages : []),
        ],
      }
    })
    builder.addCase(addMessageAndRun.rejected, (state, action) => {
      state.run = { type: 'loading-failed', errorMessage: action.error.message ?? 'Unknown error' }
    })
    builder.addCase(fetchMessages.pending, (state) => {
      state.messages =
        state.messages.type === 'loading-complete'
          ? { type: 'loading-in-progress', messages: state.messages.messages }
          : { type: 'loading-in-progress', messages: [] }
    })
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = { type: 'loading-complete', messages: action.payload.data }
    })
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.messages = { type: 'loading-failed', errorMessage: action.error.message ?? 'Unknown error' }
    })
  },
})

export const assistantReducer = assistantSlice.reducer

export const { updateRunStatus } = assistantSlice.actions

export const createNewThread = createAsyncThunk('assistant/createNewThread', async (_, thunkAPI) => {
  thread = await openaiAPI.beta.threads.create()

  return thread.id
})

export const addMessageAndRun = createAsyncThunk(
  'assistant/addMessageAndRun',
  async (args: { prompt: string; cohort?: ReadonlyArray<Patient>; selectedPatient?: Patient }, thunkAPI) => {
    console.log('Adding message and running thread...', args)

    // A prompt is set, fetch prompt embeddings and add random journeys for context
    const data = (thunkAPI.getState() as any).data as DataState
    const assistant = (thunkAPI.getState() as any).assistant as AssistantState

    console.log(data)
    console.log(assistant)

    if (
      data.type === 'loading-complete' &&
      assistant.thread.type === 'loading-complete'
      // (assistant.run.type === 'loading-pending' || assistant.run.type === 'loading-complete')
    ) {
      console.log('here2')
      let pjChunks: string[][] = []

      if (args.cohort || args.selectedPatient) {
        const patientJourneys = preparePatientJourneys(
          {
            ...data.patientData,
            allEntities: [...(args.cohort ?? []), ...(args.selectedPatient ? [args.selectedPatient] : [])] as Patient[],
          },
          data.eventData
        )

        // TODO: Tokens per Chunk should be small enough, so that there is space for the prompt
        // TODO: When creating the cohort, it should already validated towards the limit
        const { patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, TOKENS_PER_CHUNK_PROMPT)

        pjChunks = patientJourneyChunks
      }

      console.log('here3')

      const messages: MessageCreateParams[] = []

      if (pjChunks.length > 0) {
        const context = `The following patient journeys have been processed by the OpenAI Embeddings API.
The retrieved embeddings were then reduced to 2 dimensions using the t-SNE algorithm and clustered using k-means clustering (k=3).
I have then explored the resulting clusters and extracted the following specific patient journeys for further analysis:`

        messages.push({
          role: 'user',
          content: context,
          metadata: { isContext: true, showContext: false, contextTitle: '' },
        })

        pjChunks[0].forEach((patientJourney, idx) =>
          messages.push({
            role: 'user',
            content: `
Patient Journey ${idx + 1}:
------

${patientJourney}
`,
            metadata: { isContext: true, showContext: true, contextTitle: `Patient Journey ${idx + 1}` },
          } as MessageCreateParams)
        )
      }

      messages.push({
        role: 'user',
        content: `${args.prompt}`,
        metadata: { isContext: false },
      })

      console.log('Adding the following messsages to the thread: ', messages)

      try {
        for (const message of messages) {
          await openaiAPI.beta.threads.messages.create(assistant.thread.threadId, message)
        }

        console.log('Added all messages to the thread, now running it...')

        const system_instruction = `You are aware of the OpenAI Embeddings API and all the factors it considers when computing embeddings for a patient journey. You will help the user to understand, why individual patient journeys are similar based on their embeddings and you will point out relevant key factors and characteristics of the patient journeys to the user, so that they can understand the underlying reasoning. You are concise and don't mention general information about the API. `

        const run = await openaiAPI.beta.threads.runs.create(assistant.thread.threadId, {
          assistant_id: assistantGPT.id,
          instructions: system_instruction,
        })

        return {
          runId: run.id,
          threadId: assistant.thread.threadId,
          newMessages: messages,
        }
      } catch (error) {
        thunkAPI.dispatch(
          addAlerts([
            {
              type: 'error',
              topic: 'Assistant',
              message: `Could add messages and run thread. ${error}`,
            },
          ])
        )
        throw error
      }
    } else {
      console.log('here')
      throw new Error('Could not create run, data or thread not initialized!')
    }
  }
)

export const fetchMessages = createAsyncThunk('assistant/fetchMessages', async (_, thunkAPI) => {
  const assistant = (thunkAPI.getState() as any).assistant as AssistantState

  console.log('Fetching messages...')

  if (assistant.thread.type === 'loading-complete') {
    const messages = await openaiAPI.beta.threads.messages.list(assistant.thread.threadId)

    return messages
  } else {
    throw new Error('Could not fetch messages, thread not initialized!')
  }
})
