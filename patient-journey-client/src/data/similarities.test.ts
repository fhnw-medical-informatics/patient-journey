import { getByteRangeFromRowIndex } from './similarities'

describe('getByteRangeFromRowIndex', () => {
  it('Gets correct byte range', () => {
    expect(getByteRangeFromRowIndex(0, 10, 100, 1000)).toEqual([0, 10])
    expect(getByteRangeFromRowIndex(50, 10, 100, 1000)).toEqual([500, 511])
  })
  it('Gets correct byte range when chunk size is equal to file size', () => {
    expect(getByteRangeFromRowIndex(0, 1000, 100, 1000)).toEqual([0, 1000])
    expect(getByteRangeFromRowIndex(50, 1000, 100, 1000)).toEqual([0, 1000])
  })
  it('Gets correct byte range when chunk size is greater than file size', () => {
    expect(getByteRangeFromRowIndex(0, 1001, 100, 1000)).toEqual([0, 1000])
    expect(getByteRangeFromRowIndex(50, 1001, 100, 1000)).toEqual([0, 1000])
  })
  it('Clamps byte range to file size boundaries', () => {
    expect(getByteRangeFromRowIndex(0, 10, 100, 1000)).toEqual([0, 10])
    expect(getByteRangeFromRowIndex(99, 10, 100, 1000)).toEqual([990, 1000])
  })
})
