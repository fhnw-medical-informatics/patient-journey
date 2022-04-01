import { formatMillis, parseDate } from './columns'

describe('columns', () => {
  describe('formatMillies', () => {
    it('formats millis', () => {
      expect(formatMillis(1645453113884)).toEqual('21.02.2022 15:18')
      expect(formatMillis(NaN)).toEqual('')
      expect(formatMillis(Infinity)).toEqual('')
    })
  })

  describe('parseDate', () => {
    it('parses 31.12.2019', () => {
      expect(parseDate('31.12.2019').getTime()).toEqual(1577750400000)
    })
  })
})
