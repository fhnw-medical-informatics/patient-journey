import { parseMillis, parseDate } from './columns'
import { EventData, EventDataColumn, PatientJourneyEvent } from './events'
import { Patient, PatientData, PatientDataColumn } from './patients'

interface Filter<T extends FilterColumn['type']> {
  column: FilterColumn
  type: T
  value: FilterValue[T]
}

export type GenericFilter = Filter<FilterColumn['type']>

export const NO_FILTER = 'no-filter'
export type NoFilter = typeof NO_FILTER

type FilterColumn = EventDataColumn | PatientDataColumn

type FilterValue = {
  string: TextFilterValue
  number: NumberFilterValue
  boolean: BooleanFilterValue
  eid: TextFilterValue
  pid: TextFilterValue
  date: TimestampFilterValue
  timestamp: TimestampFilterValue
}

export type Millis = number
export const MillisNone = -1 as Millis

interface TextFilterValue {
  text: string
}

interface NumberFilterValue {
  from: number
  to: number
}

interface TimestampFilterValue {
  millisFrom: Millis
  millisTo: Millis
}

interface BooleanFilterValue {
  isTrue: boolean
}

export const createFilter = <T extends FilterColumn['type']>(
  column: FilterColumn,
  type: T,
  value: FilterValue[T]
): Filter<T> => {
  return {
    column,
    type,
    value,
  }
}

// TODO: Write tests
export const filterReducer = <T extends EventData | PatientData>(data: T, filter: GenericFilter): T => {
  const dataSelector = data.type === 'events' ? 'allEvents' : 'allPatients'
  const dataToFilter: EventData['allEvents'] | PatientData['allPatients'] =
    data.type === 'events' ? data.allEvents : data.allPatients

  switch (filter.type) {
    case 'string':
      return {
        ...data,
        [dataSelector]: dataToFilter.filter((row) => {
          const fieldValue = getFieldValue(row, filter)

          return (
            fieldValue.isValid &&
            fieldValue.value.toLowerCase().includes((filter as Filter<'string'>).value.text.toLowerCase())
          )
        }),
      }
    case 'number':
      return {
        ...data,
        [dataSelector]: dataToFilter.filter((row) => {
          const fieldValue = getFieldValue(row, filter)

          return (
            fieldValue.isValid &&
            +fieldValue.value <= (filter as Filter<'number'>).value.from &&
            +fieldValue.value >= (filter as Filter<'number'>).value.to
          )
        }),
      }
    case 'boolean':
      return {
        ...data,
        [dataSelector]: dataToFilter.filter((row) => {
          const fieldValue = getFieldValue(row, filter)

          return fieldValue.isValid && !!fieldValue.value === (filter as Filter<'boolean'>).value.isTrue
        }),
      }
    case 'date':
    case 'timestamp':
      const openFromDate = (filter as Filter<'timestamp'>).value.millisFrom === MillisNone
      const openToDate = (filter as Filter<'timestamp'>).value.millisTo === MillisNone

      if (openFromDate && openToDate) {
        return data
      } else {
        return {
          ...data,
          [dataSelector]: dataToFilter.filter((row) => {
            const fieldValue = getFieldValue(row, filter)

            if (!fieldValue.isValid) {
              return false
            }

            let dateValue: Date

            if (filter.type === 'timestamp') {
              dateValue = parseMillis(+fieldValue.value)
            } else if (filter.type === 'date') {
              dateValue = parseDate(fieldValue.value)
            } else {
              throw new Error('Filter is neither a timestamp nor a date')
            }

            const dateFrom = parseMillis((filter as Filter<'timestamp'>).value.millisFrom)
            const dateTo = parseMillis((filter as Filter<'timestamp'>).value.millisTo)

            // End of day when only date was used
            if (dateTo.getUTCHours() === 0 && dateTo.getUTCMinutes() === 0) {
              dateTo.setUTCHours(23, 59, 59, 999)
            }

            return (openFromDate || dateValue >= dateFrom) && (openToDate || dateValue <= dateTo)
          }),
        }
      }
    default:
      throw new Error(`Filter for type '${filter.type}' is not yet implemented`)
  }
}

type MissingFieldValue = Readonly<{
  isValid: false
}>

type ValidFieldValue<T> = Readonly<{
  isValid: true
  value: T
}>

type FieldValue<T> = MissingFieldValue | ValidFieldValue<T>

const missingFieldValue: MissingFieldValue = {
  isValid: false,
}

const safe = <T>(value?: T): FieldValue<T> =>
  value
    ? {
        isValid: true,
        value,
      }
    : missingFieldValue

function getFieldValue<T extends FilterColumn['type']>(
  entity: Patient | PatientJourneyEvent,
  filter: Filter<T>
): FieldValue<T> {
  const getSafe = () => {
    return safe(entity.values[filter.column.index])
  }
  return getSafe() as FieldValue<T>
}

// const testFn = (data: EventDataColumn | PatientDataColumn) => {
//   const test: EventDataColumn = {
//     type: 'string',
//     name: 'test',
//     index: 0,
//   }

//   if (test.type === 'string') {
//     const testFilter = createFilter(test, test.type, {})
//   } else if (test.type === 'timestamp') {
//     const testFilter = createFilter(test, test.type, {})
//   }
// }
