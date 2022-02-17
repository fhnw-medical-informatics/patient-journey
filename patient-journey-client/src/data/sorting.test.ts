import { compareNumberValues, compareStringValues, stableSort } from './sorting'
import { parseData } from './dataSlice'

const TEST_DATA =
  'Id,StringColumn,NumberColumn\n' + //
  'id,string,number\n' +
  'a,100,100\n' +
  'b,1e1,1e1\n' +
  'c,NaN,NaN\n' +
  'd,,\n' +
  'e,-,-'

describe('sorting', () => {
  it('compareStringValues', () => {
    expect(compareStringValues('1e1', '100')).toBeGreaterThan(0)
  })
  it('compareNumberValues – truly different from string sorting', () => {
    expect(compareNumberValues('1e1', '100')).toBeLessThan(0)
  })
  it('compareNumberValues – empty as NaN rather than 0', () => {
    expect(compareNumberValues('', '0')).toBeGreaterThan(0)
  })
  it('stableSort', () => {
    const data = parseData(TEST_DATA)
    const stringColumn = data.columns[1]
    const numberColumn = data.columns[2]
    expect(stableSort(data.allPatients, { type: 'asc', column: stringColumn })[0].id).toEqual('a')
    expect(stableSort(data.allPatients, { type: 'asc', column: numberColumn })[0].id).toEqual('b')
  })
})
