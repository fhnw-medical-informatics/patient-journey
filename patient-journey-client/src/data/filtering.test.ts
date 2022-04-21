import { Filter, filterReducer, MillisNone } from './filtering'

import { Entity, EntityId } from './entities'
import { PatientDataColumn } from './patients'

const mockData: ReadonlyArray<Entity> = [
  {
    uid: '1' as EntityId,
    values: ['Jessica', '25', 'false', '31.12.2019', '1648555453169', 'A'],
  },
  {
    uid: '2' as EntityId,
    values: ['Peter', '31', 'true', '31.12.2018', '1648552453169', 'B'],
  },
]

const mockColumns: ReadonlyArray<PatientDataColumn> = [
  {
    name: 'Name',
    type: 'string',
    index: 0,
  },
  {
    name: 'Age',
    type: 'number',
    index: 1,
  },
  {
    name: 'Is alive',
    type: 'boolean',
    index: 2,
  },
  {
    name: 'Birthday',
    type: 'date',
    index: 3,
  },
  {
    name: 'Timestamp',
    type: 'timestamp',
    index: 4,
  },
  {
    name: 'Blood Type',
    type: 'category',
    index: 5,
  },
]

describe('Filter Reducer', () => {
  it('should handle a string filter', () => {
    const stringFilter: Filter<'string'> = {
      column: mockColumns[0],
      type: 'string',
      value: { text: 'p' },
    }

    const filteredData = filterReducer(mockData, stringFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('2')
  })

  it('should handle a string filter case insensitive', () => {
    const stringFilter: Filter<'string'> = {
      column: mockColumns[0],
      type: 'string',
      value: { text: 'P' },
    }

    const filteredData = filterReducer(mockData, stringFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('2')
  })

  it('should handle a string filter with an empty value', () => {
    const stringFilter: Filter<'string'> = {
      column: mockColumns[0],
      type: 'string',
      value: { text: '' },
    }

    const filteredData = filterReducer(mockData, stringFilter)
    expect(filteredData.length).toBe(2)
    expect(filteredData[0].uid).toBe('1')
    expect(filteredData[1].uid).toBe('2')
  })

  it('should handle a number filter', () => {
    const numberFilter: Filter<'number'> = {
      column: mockColumns[1],
      type: 'number',
      value: { from: 23, to: 30 },
    }

    const filteredData = filterReducer(mockData, numberFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle number filter from values inclusive', () => {
    const numberFilter: Filter<'number'> = {
      column: mockColumns[1],
      type: 'number',
      value: { from: 25, to: 30 },
    }

    const filteredData = filterReducer(mockData, numberFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle number filter to values inclusive', () => {
    const numberFilter: Filter<'number'> = {
      column: mockColumns[1],
      type: 'number',
      value: { from: 23, to: 25 },
    }

    const filteredData = filterReducer(mockData, numberFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle a boolean filter when true', () => {
    const booleanFilter: Filter<'boolean'> = {
      column: mockColumns[2],
      type: 'boolean',
      value: { isTrue: true },
    }

    const filteredData = filterReducer(mockData, booleanFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('2')
  })

  it('should handle a boolean filter when false', () => {
    const booleanFilter: Filter<'boolean'> = {
      column: mockColumns[2],
      type: 'boolean',
      value: { isTrue: false },
    }

    const filteredData = filterReducer(mockData, booleanFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle a date filter', () => {
    const dateFilter: Filter<'date'> = {
      column: mockColumns[3],
      type: 'date',
      value: { millisFrom: 1577660400000, millisTo: 1580511600000 },
    }

    const filteredData = filterReducer(mockData, dateFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it(`should handle a date filter with millisTo ${MillisNone}`, () => {
    const dateFilter: Filter<'date'> = {
      column: mockColumns[3],
      type: 'date',
      value: { millisFrom: 1577660400000, millisTo: MillisNone },
    }

    const filteredData = filterReducer(mockData, dateFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it(`should handle a date filter with millisFrom ${MillisNone}`, () => {
    const dateFilter: Filter<'date'> = {
      column: mockColumns[3],
      type: 'date',
      value: { millisFrom: MillisNone, millisTo: 1577660400000 },
    }

    const filteredData = filterReducer(mockData, dateFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('2')
  })

  it('should handle date filter millisFrom values inclusive', () => {
    const dateFilter: Filter<'date'> = {
      column: mockColumns[3],
      type: 'date',
      value: { millisFrom: 1577750400000, millisTo: 1580511600000 },
    }

    const filteredData = filterReducer(mockData, dateFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle date filter millisTo values inclusive', () => {
    const dateFilter: Filter<'date'> = {
      column: mockColumns[3],
      type: 'date',
      value: { millisFrom: 1577660400000, millisTo: 1577750400000 },
    }

    const filteredData = filterReducer(mockData, dateFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle a timestamp filter', () => {
    const timestampFilter: Filter<'timestamp'> = {
      column: mockColumns[4],
      type: 'timestamp',
      value: { millisFrom: 1648555453168, millisTo: 1648555453170 },
    }

    const filteredData = filterReducer(mockData, timestampFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it(`should handle a timestamp filter with millisTo ${MillisNone}`, () => {
    const timestampFilter: Filter<'timestamp'> = {
      column: mockColumns[4],
      type: 'timestamp',
      value: { millisFrom: 1648555453168, millisTo: MillisNone },
    }

    const filteredData = filterReducer(mockData, timestampFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it(`should handle a timestamp filter with millisFrom ${MillisNone}`, () => {
    const timestampFilter: Filter<'timestamp'> = {
      column: mockColumns[4],
      type: 'timestamp',
      value: { millisFrom: MillisNone, millisTo: 1648555453168 },
    }

    const filteredData = filterReducer(mockData, timestampFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('2')
  })

  it('should handle timestamp filter millisFrom values inclusive', () => {
    const timestampFilter: Filter<'timestamp'> = {
      column: mockColumns[4],
      type: 'timestamp',
      value: { millisFrom: 1648555453169, millisTo: 1648555453172 },
    }

    const filteredData = filterReducer(mockData, timestampFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle timestamp filter millisTo values inclusive', () => {
    const timestampFilter: Filter<'timestamp'> = {
      column: mockColumns[4],
      type: 'timestamp',
      value: { millisFrom: 1648555453168, millisTo: 1648555453169 },
    }

    const filteredData = filterReducer(mockData, timestampFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle a qualitative filter', () => {
    const categoryFilter: Filter<'category'> = {
      column: mockColumns[5],
      type: 'category',
      value: { text: 'A' },
    }

    const filteredData = filterReducer(mockData, categoryFilter)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].uid).toBe('1')
  })

  it('should handle a qualitative filter with a non-existing category', () => {
    const categoryFilter: Filter<'category'> = {
      column: mockColumns[5],
      type: 'category',
      value: { text: 'O−' },
    }

    const filteredData = filterReducer(mockData, categoryFilter)
    expect(filteredData.length).toBe(0)
  })

  it('should handle a qualitative filter with an empty value', () => {
    const categoryFilter: Filter<'category'> = {
      column: mockColumns[5],
      type: 'category',
      value: { text: '' },
    }

    const filteredData = filterReducer(mockData, categoryFilter)
    expect(filteredData.length).toBe(2)
    expect(filteredData[0].uid).toBe('1')
    expect(filteredData[1].uid).toBe('2')
  })
})
