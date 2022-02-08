import '@testing-library/jest-dom'

const globalAny = global as any
globalAny.fetch = () => ({
  text: () => Promise.resolve(''),
})
