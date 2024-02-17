import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Patient } from '../data/patients'
import { DataState, setIndexPatient } from '../data/dataSlice'
import { createPatientJourneysChunks, preparePatientJourneys, TOKENS_PER_CHUNK_PROMPT } from '../data/embeddings'
import { openaiAPI } from '../utils/openai'
import { addAlerts } from '../alert/alertSlice'
import OpenAI from 'openai'
import ChatCompletionSystemMessageParam = OpenAI.ChatCompletionSystemMessageParam
import ChatCompletionTool = OpenAI.ChatCompletionTool
import ChatCompletionToolMessageParam = OpenAI.ChatCompletionToolMessageParam

interface ChatPrompt {
  readonly prompt: string
  readonly cohort?: ReadonlyArray<Patient>
  readonly selectedPatient?: Patient
}

export interface ChatMessageData {
  readonly role: 'user' | 'assistant'
  readonly isContext: boolean
  readonly contextTitle: string
  readonly showContext: boolean
  readonly content: string
  readonly showTruncationError?: boolean
}

interface ChatState {
  readonly loadingState: 'idle' | 'loading-in-progress' | 'loading-failed'
  readonly messages: ReadonlyArray<ChatMessageData>
}

const initialState: ChatState = {
  loadingState: 'idle',
  messages: [],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(addPrompt.pending, (state) => {
      state.loadingState = 'loading-in-progress'
    })
    builder.addCase(addPrompt.fulfilled, (state, action) => {
      state.loadingState = 'idle'
      state.messages = [
        ...state.messages,
        {
          role: 'assistant',
          content: action.payload.choices[0].message.content ?? '',
          isContext: false,
          contextTitle: '',
          showContext: false,
          showTruncationError: action.payload.choices[0].finish_reason === 'length',
        },
      ]
    })
    builder.addCase(addPrompt.rejected, (state) => {
      state.loadingState = 'loading-failed'
    })
  },
})

export const chatReducer = chatSlice.reducer

export const { reset } = chatSlice.actions
const { setMessages } = chatSlice.actions

const systemMessage: ChatCompletionSystemMessageParam = {
  role: 'system',
  content: `Your are a medical data analyst assistant.

You are aware of the OpenAI Embeddings API and all the factors it considers when computing embeddings for a patient journey.
You will help the user to analyze patient journey, for examply you help to understand why individual patient journeys are similar based on their embeddings and you will point out relevant key factors and characteristics of the patient journeys to the user, so that they can understand the underlying reasoning.

You are concise and answer every question very short (unless explicitly asked to provide more details). When you answer, you use a simple but "visual" language (like bullet points, highlighting important words, etc…) by using markdown styles. Don't mention general information about the API.`,
}

const tools: Array<ChatCompletionTool> = [
  {
    type: 'function',
    function: {
      name: 'setIndexPatient',
      description:
        'Sets a specific patient journey as the index patient, allowing the user to view similar patient journeys in the app.',
      parameters: {
        type: 'object',
        properties: {
          caseId: {
            type: 'string',
            description: 'The patient journey id (case_id).',
          },
        },
        required: ['caseId'],
      },
    },
  },
]

export const addPrompt = createAsyncThunk('chat/addPrompt', async (prompt: ChatPrompt, thunkAPI) => {
  // A prompt is set, fetch prompt embeddings and add random journeys for context
  const data = (thunkAPI.getState() as any).data as DataState
  const chat = (thunkAPI.getState() as any).chat as ChatState

  if (data.type === 'loading-complete') {
    let pjChunks: string[][] = []

    if (prompt.cohort || prompt.selectedPatient) {
      const patientJourneys = preparePatientJourneys(
        {
          ...data.patientData,
          allEntities: [
            ...(prompt.cohort ?? []),
            ...(prompt.selectedPatient ? [prompt.selectedPatient] : []),
          ] as Patient[],
        },
        data.eventData
      )

      // TODO: Tokens per Chunk should be small enough, so that there is space for the prompt
      // TODO: When creating the cohort, it should already validated towards the limit
      const { patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, TOKENS_PER_CHUNK_PROMPT)

      pjChunks = patientJourneyChunks
    }

    const messages: Array<ChatMessageData> = [...chat.messages]

    if (pjChunks.length > 0) {
      const context = `The following patient journeys have been processed by the OpenAI Embeddings API.
The retrieved embeddings were then reduced to 2 dimensions using the t-SNE algorithm and clustered using k-means clustering (k=3).
I have then explored the resulting clusters and extracted the following specific patient journeys for further analysis:`

      messages.push({
        role: 'user',
        content: context,
        isContext: true,
        showContext: false,
        contextTitle: '',
      })

      messages.push({
        role: 'user',
        content: pjChunks[0]
          .map(
            (patientJourney, idx) =>
              `Patient Journey ${idx + 1}:
------

${patientJourney}
`
          )
          .join('\n\n'),
        isContext: true,
        showContext: true,
        contextTitle: `${pjChunks[0].length} Patient Journey(s)`,
      })
    }

    messages.push({
      role: 'user',
      content: `${prompt.prompt}`,
      isContext: false,
      showContext: false,
      contextTitle: '',
    })

    thunkAPI.dispatch(setMessages(messages))

    try {
      // we keep rich messages (e.g. including cohort info) in redux state, but use simple ones to pass to the api
      const simpleMessages = [systemMessage, ...messages.map((m) => ({ role: m.role, content: m.content }))]

      const response = await openaiAPI.chat.completions.create({
        messages: simpleMessages,
        tools,
        model: import.meta.env.VITE_OPENAI_MODEL,
      })

      if (response.choices[0].finish_reason === 'length') {
        thunkAPI.dispatch(
          addAlerts([
            {
              type: 'warning',
              topic: 'Chat',
              message: 'AI response truncated (max number of tokens reached)',
            },
          ])
        )
      }

      const responseMessage = response.choices[0].message

      if (responseMessage.tool_calls) {
        const toolCalls = responseMessage.tool_calls
        const toolMessages: Array<ChatCompletionToolMessageParam> = []
        for (const toolCall of toolCalls) {
          thunkAPI.dispatch(setIndexPatient(JSON.parse(toolCall.function.arguments).caseId))
          toolMessages.push({
            role: 'tool',
            content: 'Index patient set',
            tool_call_id: toolCall.id,
          })
        }
        // notify the api that we've invoked the function (this will lead to a proper assistant message in our history)
        return await openaiAPI.chat.completions.create({
          messages: [...simpleMessages, responseMessage, ...toolMessages],
          tools,
          model: import.meta.env.VITE_OPENAI_MODEL,
        })
      } else {
        return response
      }
    } catch (error) {
      thunkAPI.dispatch(
        addAlerts([
          {
            type: 'error',
            topic: 'Chat',
            message: `Interacting with AI failed. ${error}`,
          },
        ])
      )
      throw error
    }
  } else {
    throw new Error('Interacting with AI failed.')
  }
})
