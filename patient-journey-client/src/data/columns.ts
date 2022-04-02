import { format as dateFnFormat, toDate, parseISO, formatISO } from 'date-fns'

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
  try {
    return JSON.parse(s)
  } catch (e) {
    return false
  }
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
