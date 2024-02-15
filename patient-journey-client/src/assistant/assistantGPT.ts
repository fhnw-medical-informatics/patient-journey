import { Assistant } from 'openai/resources/beta/assistants/assistants'
import { openaiAPI } from '../utils/openai'

export const assistantGPT: Assistant = await openaiAPI.beta.assistants.retrieve(
  import.meta.env.VITE_OPENAI_ASSISTANT_ID
)
