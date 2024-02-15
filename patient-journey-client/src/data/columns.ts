import { format as dateFnFormat, formatISO, parseISO, toDate } from 'date-fns'
import { Entity } from './entities'

export interface DataColumn<T> {
  readonly name: string
  readonly type: T
  readonly index: number
}

export const GENERIC_COLUMN_TYPES = ['string', 'boolean', 'number', 'date', 'timestamp', 'category'] as const

const isEmpty = (s: string) => !s || s.trim().length === 0

export const stringToNumber = (s: string) => {
  // treat empty as NaN (rather than 0)
  return isEmpty(s) ? NaN : +s
}

export const stringToBoolean = (s: string) => {
  return isEmpty(s) ? false : s.toLowerCase() === 'true'
}

export const DATE_TIMESTAMP_FORMAT = 'dd.MM.yyyy HH:mm'
export const DATE_FORMAT = 'dd.MM.yyyy'

// Parses a date string in the format "dd.MM.yyyy" to a Date object
// We don't use date-fns parse, because it's performance is much slower
// than the native Date.parse / new Date()
export const parseDate = (date: string) => {
  const [day, month, year] = date.split('.')
  return new Date(`${year}-${month}-${day} 00:00:00.000`)
}

export const parseHTMLDateInput = (isoDateString: string) => parseISO(isoDateString)

export const stringToMillis = (s: string): number => parseDate(s).valueOf()

export const parseMillis = (ms: number) => toDate(ms)

export const format = (date: Date | number, formatString: string = DATE_TIMESTAMP_FORMAT) =>
  dateFnFormat(date, formatString)
export const formatMillis = (ms: number) => (isFinite(ms) ? format(parseMillis(ms), DATE_TIMESTAMP_FORMAT) : '')

export const formatHTMLDateInput = (ms: number) => (isFinite(ms) ? formatISO(parseMillis(ms)) : '')

export const isValidDate = (date: any): boolean => {
  return !isNaN(date) && date instanceof Date
}

export const extractNumberValueSafe =
  (column: DataColumn<'number'>) =>
  (entity: Entity): [number] | [] => {
    const value = entity.values[column.index] ?? ''
    if (value === null || value.trim().length === 0) {
      return []
    } else {
      return [stringToNumber(value)]
    }
  }

export const extractDateValueSafe =
  (column: DataColumn<'timestamp' | 'date'>) =>
  (entity: Entity): [Date] | [] => {
    const value = entity.values[column.index] ?? ''
    if (value === null || value.trim().length === 0) {
      return []
    } else if (column.type === 'timestamp') {
      return [parseMillis(+value)]
    } else {
      return [parseDate(value)]
    }
  }

export const extractCategoryValueSafe =
  (column: DataColumn<'category'>) =>
  (entity: Entity): [string] | [] => {
    const value = entity.values[column.index] ?? ''
    if (value === undefined || value.trim().length === 0) {
      return []
    } else {
      return [value]
    }
  }

export const extractStringValuesSafe =
  (column: DataColumn<any>) =>
  (entity: Entity): [string] | [] => {
    const value = entity.values[column.index] ?? ''
    if (value === undefined || value.trim().length === 0) {
      return []
    } else {
      return [value]
    }
  }

export const extractColumnValueSafe = (column: DataColumn<any>) => {
  switch (column.type) {
    case 'number':
      return extractNumberValueSafe(column)
    case 'timestamp':
    case 'date':
      return extractDateValueSafe(column)
    case 'category':
      return extractCategoryValueSafe(column)
    default:
      return extractStringValuesSafe(column)
  }
}

export const formatColumnValue = (columnType: string) => (value: string) => {
  if (value === undefined || value === null || value.trim().length === 0) {
    return ''
  }
  switch (columnType) {
    case 'boolean':
      return stringToBoolean(value) ? 'X' : ''
    case 'timestamp':
      return formatMillis(+value)
    default:
      return value
  }
}

export const compareColumns = (v1: DataColumn<any>, v2: DataColumn<any>) =>
  v1.name === v2.name && v1.index === v2.index && v1.type === v2.type

export const doesContainColumn = (columns: ReadonlyArray<DataColumn<any>>, column: Readonly<DataColumn<any>>) => {
  return columns.some((c) => compareColumns(c, column))
}
