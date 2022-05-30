import { parseMillis, parseDate, stringToBoolean } from './columns'
import { Entity } from './entities'
import { EventDataColumn } from './events'
import { PatientDataColumn } from './patients'

export interface Filter<T extends FilterColumn['type']> {
  column: FilterColumn
  type: T
  value: FilterValue[T]
}

export type GenericFilter = Filter<FilterColumn['type']>

export const NO_FILTER = 'no-filter'
export type NoFilter = typeof NO_FILTER

export type FilterColumn = EventDataColumn | PatientDataColumn

type FilterValue = {
  string: TextFilterValue
  number: NumberFilterValue
  boolean: BooleanFilterValue
  eid: TextFilterValue
  pid: TextFilterValue
  date: TimestampFilterValue
  timestamp: TimestampFilterValue
  category: CategoryFilterValue
}

interface TextFilterValue {
  text: string
}

export const NumberNone = NaN

interface NumberFilterValue {
  from: number
  to: number
  toInclusive: boolean
}

export type Millis = number
export const MillisNone = -1 as Millis

interface TimestampFilterValue {
  millisFrom: Millis
  millisTo: Millis
  toInclusive: boolean
}

export type Trilian = boolean | 'None'
export const TrilianNone = 'None' as Trilian

interface BooleanFilterValue {
  isTrue: Trilian
}

export const CategoryFilterNone = ''

interface CategoryFilterValue {
  categories: string[]
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

export const filterReducer = (data: ReadonlyArray<Entity>, filter: GenericFilter): ReadonlyArray<Entity> => {
  switch (filter.type) {
    case 'string':
      return data.filter((row) => {
        const fieldValue = getFieldValue(row, filter)

        return (
          fieldValue.isValid &&
          fieldValue.value.toLowerCase().includes((filter as Filter<'string'>).value.text.toLowerCase())
        )
      })
    case 'number': {
      const openFrom = isNaN((filter as Filter<'number'>).value.from)
      const openTo = isNaN((filter as Filter<'number'>).value.to)

      const isToInclusive = (filter as Filter<'number'>).value.toInclusive

      if (openFrom && openTo) {
        return data
      } else {
        return data.filter((row) => {
          const fieldValue = getFieldValue(row, filter)

          return (
            fieldValue.isValid &&
            (openFrom || +fieldValue.value >= (filter as Filter<'number'>).value.from) &&
            (openTo ||
              (isToInclusive
                ? +fieldValue.value <= (filter as Filter<'number'>).value.to
                : +fieldValue.value < (filter as Filter<'number'>).value.to))
          )
        })
      }
    }
    case 'boolean':
      const openBool = (filter as Filter<'boolean'>).value.isTrue === TrilianNone

      return data.filter((row) => {
        const fieldValue = getFieldValue(row, filter)

        return (
          openBool ||
          (fieldValue.isValid && stringToBoolean(fieldValue.value) === (filter as Filter<'boolean'>).value.isTrue)
        )
      })
    case 'date':
    case 'timestamp': {
      const openFromDate = (filter as Filter<'timestamp'>).value.millisFrom === MillisNone
      const openToDate = (filter as Filter<'timestamp'>).value.millisTo === MillisNone

      const isToInclusive = (filter as Filter<'timestamp'>).value.toInclusive

      if (openFromDate && openToDate) {
        return data
      } else {
        return data.filter((row) => {
          const fieldValue = getFieldValue(row, filter)

          if (!fieldValue.isValid) {
            return false
          }

          let dateValue: number
          let dateFrom: number
          let dateTo: number

          if (filter.type === 'timestamp') {
            dateValue = +fieldValue.value
            dateFrom = (filter as Filter<'timestamp'>).value.millisFrom
            dateTo = (filter as Filter<'timestamp'>).value.millisTo
          } else if (filter.type === 'date') {
            // TODO: Avoid parseDate here as well.
            dateValue = parseDate(fieldValue.value).valueOf()
            dateFrom = (filter as Filter<'timestamp'>).value.millisFrom

            const dateToTmp = parseMillis((filter as Filter<'timestamp'>).value.millisTo)

            // End of day when only date was used
            if (dateToTmp.getUTCHours() === 0 && dateToTmp.getUTCMinutes() === 0) {
              dateToTmp.setUTCHours(23, 59, 59, 999)
            }

            dateTo = dateToTmp.valueOf()
          } else {
            throw new Error('Filter is neither a timestamp nor a date')
          }

          return (
            (openFromDate || dateValue >= dateFrom) &&
            (openToDate || (isToInclusive ? dateValue <= dateTo : dateValue < dateTo))
          )
        })
      }
    }
    case 'category':
      return data.filter((row) => {
        const fieldValue = getFieldValue(row, filter)
        const categories = new Set((filter as Filter<'category'>).value.categories)

        return fieldValue.isValid && categories.has(fieldValue.value)
      })
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
  value !== undefined
    ? {
        isValid: true,
        value,
      }
    : missingFieldValue

function getFieldValue<T extends FilterColumn['type']>(entity: Entity, filter: Filter<T>): FieldValue<string> {
  const getSafe = () => {
    return safe(entity.values[filter.column.index])
  }
  return getSafe() as FieldValue<T>
}
