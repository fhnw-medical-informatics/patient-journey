// In addition to 'asc' | 'desc', we support a 3rd 'neutral' state (import order)

import { DataColumn, stringToBoolean, stringToMillis, stringToNumber } from './columns'
import { Entity } from './entities'

type NeutralSortingState = Readonly<{
  type: 'neutral' // import order
}>
export const ColumnSortingStateNeutral: NeutralSortingState = { type: 'neutral' }

export type ColumnSortingState =
  | NeutralSortingState
  | Readonly<{
      type: 'asc' | 'desc'
      column: DataColumn<string>
    }>

// Sorting logic inspired by https://codesandbox.io/s/f71wj?file=/demo.js
export const stableSort = (rows: ReadonlyArray<Entity>, sortingState: ColumnSortingState) => {
  if (sortingState.type === 'neutral') {
    return rows
  } else {
    const stabilizedThis = rows.map<[Entity, number]>((rowData, index) => [rowData, index])
    stabilizedThis.sort((a, b) => {
      const comparator = getComparator(sortingState.type, sortingState.column)
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedThis.map((e) => e[0])
  }
}

function getComparator(order: 'asc' | 'desc', column: DataColumn<string>) {
  return (p1: Entity, p2: Entity) => (order === 'asc' ? 1 : -1) * compareEntities(p1, p2, column)
}

function compareEntities(p1: Entity, p2: Entity, column: DataColumn<string>) {
  const v1 = p1.values[column.index]
  const v2 = p2.values[column.index]

  return compareEntityValues(v1, v2, column)
}

function compareEntityValues(v1: any, v2: any, column: DataColumn<any>) {
  switch (column.type) {
    case 'number':
    case 'timestamp':
      return compareNumberValues(v1, v2)
    case 'boolean':
      return compareBooleanValues(v1, v2)
    case 'date':
      return compareDateValues(v1, v2)
    default:
      return compareStringValues(v1, v2)
  }
}

const emptyStringsToEnd = (v1: string, v2: string, safeComparator: (v1: string, v2: string) => number) => {
  if (v1.trim().length === 0) {
    if (v2.trim().length === 0) {
      return 0
    } else {
      return 1 // empty strings to the end
    }
  } else {
    return safeComparator(v1, v2)
  }
}

export function compareStringValues(v1: string, v2: string) {
  return emptyStringsToEnd(v1, v2, (v1, v2) => v1.localeCompare(v2))
}

export function compareBooleanValues(v1: string, v2: string) {
  return emptyStringsToEnd(v1, v2, (v1, _) => {
    return stringToBoolean(v1) ? -1 : 1
  })
}

export function compareNumberValues(v1: string, v2: string) {
  const n1 = stringToNumber(v1)
  const n2 = stringToNumber(v2)
  return compareNanSafe(n1, n2)
}

function compareNanSafe(n1: number, n2: number) {
  if (isNaN(n1)) {
    if (isNaN(n2)) {
      return 0
    } else {
      return 1 // NaN values to the end
    }
  }
  return isNaN(n2) ? -1 : Math.sign(n1 - n2)
}

export function compareDateValues(v1: string, v2: string) {
  return emptyStringsToEnd(v1, v2, (v1, v2) => {
    const m1 = stringToMillis(v1)
    const m2 = stringToMillis(v2)
    return compareNanSafe(m1, m2)
  })
}
