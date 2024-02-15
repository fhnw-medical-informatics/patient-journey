import OpenAI from 'openai'

export const openaiAPI = new OpenAI({
  organization: import.meta.env.VITE_OPENAI_ORG,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})
