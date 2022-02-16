// In addition to 'asc' | 'desc', we support a 3rd 'neutral' state (import order)

import { Patient, PatientDataColumn } from './dataSlice'

export type ColumnSortingState =
  | Readonly<{
      type: 'neutral' // import order
    }>
  | Readonly<{
      type: 'asc' | 'desc'
      column: PatientDataColumn
    }>

// Sorting logic inspired by https://codesandbox.io/s/f71wj?file=/demo.js
export const stableSort = (rows: ReadonlyArray<Patient>, sortingState: ColumnSortingState) => {
  if (sortingState.type === 'neutral') {
    return rows
  } else {
    const stabilizedThis = rows.map<[Patient, number]>((rowData, index) => [rowData, index])
    stabilizedThis.sort((a, b) => {
      const comparator = getComparator(sortingState.type, sortingState.column)
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedThis.map((e) => e[0])
  }
}

function getComparator(order: 'asc' | 'desc', column: PatientDataColumn) {
  return (p1: Patient, p2: Patient) => (order === 'desc' ? -1 : 1) * comparePatients(p1, p2, column)
}

function comparePatients(p1: Patient, p2: Patient, column: PatientDataColumn) {
  const v1 = p1.values[column.index]
  const v2 = p2.values[column.index]
  switch (column.type) {
    case 'number':
      return compareNumberValues(+v1, +v2)
    default:
      return compareStringValues(v1, v2)
  }
}

export function compareStringValues(v1: string, v2: string): number {
  return v1.localeCompare(v2)
}

export function compareNumberValues(v1: number, v2: number): number {
  return v1 - v2
}
