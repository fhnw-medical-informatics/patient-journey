import { format as dateFnFormat, formatISO, parseISO, toDate } from 'date-fns'
import { Entity } from './entities'

export interface DataColumn<T> {
  readonly name: string
  readonly type: T
  readonly index: number
}

export const GENERIC_COLUMN_TYPES = ['string', 'boolean', 'number', 'date', 'timestamp', 'quality'] as const

const isEmpty = (s: string) => s.trim().length === 0

export const stringToNumber = (s: string) => {
  // treat empty as NaN (rather than 0)
  return isEmpty(s) ? NaN : +s
}

export const stringToBoolean = (s: string) => {
  return isEmpty(s) ? false : s.toLowerCase() === 'true'
}

const DATE_TIMESTAMP_FORMAT = 'dd.MM.yyyy HH:mm'

// Parses a date string in the format "dd.MM.yyyy" to a Date object
// We don't use date-fns parse, because it's performance is much slower
// than the native Date.parse / new Date()
export const parseDate = (date: string) => {
  const [day, month, year] = date.split('.')
  return new Date(`${year}-${month}-${day}`)
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
      return [parseMillis(stringToMillis(value))]
    } else {
      return [parseDate(value)]
    }
  }

export const extractQualityValueSafe =
  (column: DataColumn<'quality'>) =>
  (entity: Entity): [string] | [] => {
    const value = entity.values[column.index] ?? ''
    if (value === undefined || value.trim().length === 0) {
      return []
    } else {
      return [value]
    }
  }
