import { compareDateValues, compareNumberValues, compareStringValues, stableSort } from './sorting'
import { parseData } from './dataSlice'

const TEST_DATA =
  'Id,StringColumn,NumberColumn,DateColumn\n' + //
  'id,string,number,date\n' +
  'a,100,100,01.01.2022\n' +
  'b,1e1,1e1,\n' +
  'c,NaN,NaN,02.01.2021\n' +
  'd,,,\n' +
  'e,-,-,'

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
  it('compareDateValues', () => {
    expect(compareDateValues('01.01.2022', '02.01.2021')).toBeGreaterThan(0)
    expect(compareDateValues('', '02.01.2021')).toBeGreaterThan(0)
  })
  it('stableSort', () => {
    const data = parseData(TEST_DATA)
    const stringColumn = data.columns[1]
    const numberColumn = data.columns[2]
    const dateColumn = data.columns[3]
    expect(stableSort(data.allPatients, { type: 'asc', column: stringColumn })[0].id).toEqual('a')
    expect(stableSort(data.allPatients, { type: 'asc', column: numberColumn })[0].id).toEqual('b')
    expect(stableSort(data.allPatients, { type: 'asc', column: dateColumn })[0].id).toEqual('c')
  })
})
