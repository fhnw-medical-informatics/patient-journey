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
  return (a: Patient, b: Patient) => (order === 'desc' ? 1 : -1) * comparePatients(a, b, column)
}

function comparePatients(a: Patient, b: Patient, column: PatientDataColumn) {
  return b.values[column.index].localeCompare(a.values[column.index])
}
