import '@testing-library/jest-dom'
import 'vitest-canvas-mock'

const { Response } = require('whatwg-fetch')

const globalAny = global as any
globalAny.fetch = () => ({
  text: () => Promise.resolve(''),
})
globalAny.Response = Response

const mockOpenAI = jest.fn().mockImplementation(() => ({
  organization: 'mocked_organization',
  apiKey: 'mocked_api_key',
  dangerouslyAllowBrowser: true,
  beta: {
    assistants: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'mocked_assistant_id',
      }),
    },
  },
}))

jest.mock('openai', () => {
  return {
    default: mockOpenAI,
  }
})
