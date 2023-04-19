import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: import.meta.env.VITE_OPENAI_ORG,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
})

export const openaiAPI = new OpenAIApi(configuration)

// await openaiAPI.listEngines().then((response) => {
//   console.log(response)
// })
