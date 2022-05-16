import { formatMillis, parseDate, stringToBoolean } from './columns'

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
      expect(parseDate('31.12.2019').getTime()).toEqual(1577746800000)
    })
  })

  describe('stringToBoolean', () => {
    it('parses true', () => {
      expect(stringToBoolean('true')).toEqual(true)
    })

    it('parses false', () => {
      expect(stringToBoolean('false')).toEqual(false)
    })

    it('parses empty', () => {
      expect(stringToBoolean('')).toEqual(false)
    })

    it('parses capital true', () => {
      expect(stringToBoolean('TRUE')).toEqual(true)
    })

    it('parses capital false', () => {
      expect(stringToBoolean('FALSE')).toEqual(false)
    })
  })
})
