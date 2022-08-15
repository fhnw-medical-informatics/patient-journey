import '@testing-library/jest-dom'
import 'vitest-canvas-mock'

const { Response } = require('whatwg-fetch')

const globalAny = global as any
globalAny.fetch = () => ({
  text: () => Promise.resolve(''),
})
globalAny.Response = Response
