import { getChunkSize } from '.'

describe('getChunkSize', () => {
  it('should return the correct chunk size', () => {
    expect(getChunkSize(10, 2)).toBe(5)
  })
  it('should always return a chunk size that is a multiple of the total', () => {
    expect(getChunkSize(10, 4)).toBe(5)
  })
  it('should work with prime numbers', () => {
    expect(getChunkSize(11, 3)).toBe(11)
    expect(getChunkSize(13, 3)).toBe(13)
  })
  it('should work with large chunks', () => {
    expect(getChunkSize(10, 500)).toBe(1)
  })
})
