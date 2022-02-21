import { formatMillis } from './columnTypes'

describe('columnTypes', () => {
  it('formatMillis', () => {
    expect(formatMillis(1645453113884)).toEqual('21.02.2022 15:18')
    expect(formatMillis(NaN)).toEqual('')
    expect(formatMillis(Infinity)).toEqual('')
  })
})
