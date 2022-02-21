import { format as dateFnFormat, parse, toDate } from 'date-fns'

export type PatientDataColumnType = 'id' | 'string' | 'boolean' | 'number' | 'date' | 'timestamp'

const isEmpty = (s: string) => s.trim().length === 0

export const stringToNumber = (s: string) => {
  // treat empty as NaN (rather than 0)
  return isEmpty(s) ? NaN : +s
}

const DATE_FORMAT = 'dd.MM.yyyy'
const DATE_TIMESTAMP_FORMAT = 'dd.MM.yyyy HH:mm'

// new Date('2020-01-01') does not work reliably in all browsers
const parseDate = (date: string) => parse(date, DATE_FORMAT, new Date())

export const stringToMillis = (s: string): number => parseDate(s).valueOf()

export const parseMillis = (ms: number) => toDate(ms)

const format = (date: Date | number, formatString: string) => dateFnFormat(date, formatString)
export const formatMillis = (ms: number) => (isFinite(ms) ? format(parseMillis(ms), DATE_TIMESTAMP_FORMAT) : '')
