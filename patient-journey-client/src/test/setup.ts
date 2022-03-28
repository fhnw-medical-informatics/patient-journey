import '@testing-library/jest-dom'
const { Response } = require('whatwg-fetch')

const globalAny = global as any
globalAny.fetch = () => ({
  text: () => Promise.resolve(''),
})
globalAny.Response = Response
