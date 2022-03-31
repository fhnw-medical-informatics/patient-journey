import { EVENT_DATA_COLUMN_TYPES, isEventDataColumnType } from './events'

describe('events', () => {
  it('isEventDataColumnType', () => {
    EVENT_DATA_COLUMN_TYPES.forEach((type) => {
      expect(isEventDataColumnType(type)).toBe(true)
    })
    expect(isEventDataColumnType('foo')).toBe(false)
  })
})
