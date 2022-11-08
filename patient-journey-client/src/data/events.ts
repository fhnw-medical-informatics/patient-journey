import { DataColumn, GENERIC_COLUMN_TYPES } from './columns'
import { PATIENT_ID_COLUMN_TYPE, PatientId } from './patients'
import { DataEntity, Entity, EntityId } from './entities'
import { noOp } from '../utils'

export const EVENT_ID_COLUMN_TYPE = 'eid' as const

export const EVENT_DATA_COLUMN_TYPES = [...GENERIC_COLUMN_TYPES, EVENT_ID_COLUMN_TYPE, PATIENT_ID_COLUMN_TYPE] as const
export type EventDataColumnType = typeof EVENT_DATA_COLUMN_TYPES[number]

export type EventDataColumn = DataColumn<EventDataColumnType>

enum EventIdBrand {}

export type EventId = EventIdBrand & string

export interface PatientJourneyEvent extends Entity {
  readonly eid: EventId
  readonly pid: PatientId
}

export interface EventData extends DataEntity<PatientJourneyEvent, EventDataColumn> {}

export const EMPTY_EVENT_DATA: EventData = {
  columns: [],
  allEntities: [],
}

export const createEventData = (
  data: ReadonlyArray<string[]>,
  headerRowCount: number,
  onWarning: (message: string) => void = noOp
): EventData => {
  const columnNames = data[0]
  const columnTypes = data[1].map((v) => v.toLowerCase())
  const eventIdColumnIndex = columnTypes.indexOf(EVENT_ID_COLUMN_TYPE)
  const isMissingEventIdColumn = eventIdColumnIndex < 0
  const patientIdColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
  const isMissingPatientIdColumn = patientIdColumnIndex < 0

  if (isMissingPatientIdColumn) {
    throw new Error(`No '${PATIENT_ID_COLUMN_TYPE}' column type found in event data table.`)
  }

  if (isMissingEventIdColumn) {
    onWarning(`No '${EVENT_ID_COLUMN_TYPE}' column type found in event data table. Using row index to identify events.`)
  }

  columnTypes.forEach((type) => {
    if (!isEventDataColumnType(type)) {
      onWarning(`Invalid column type '${type}' found in event data table. Falling back to 'string'.`)
    }
  })

  const columns = columnNames.map<EventDataColumn>((name, index) => ({
    name,
    type: columnTypes[index] as EventDataColumnType,
    index,
  }))
  return {
    ...EMPTY_EVENT_DATA,
    columns,
    allEntities: data.slice(headerRowCount).map((row: string[], index) => {
      const id = isMissingEventIdColumn ? String(index) : row[eventIdColumnIndex]

      validateEventRow(index + 1 + headerRowCount, row, columnNames, columnTypes as EventDataColumnType[], onWarning)

      return {
        uid: id as EntityId,
        eid: id as EventId,
        pid: row[patientIdColumnIndex] as PatientId,
        values: row,
      }
    }),
  }
}

const validateEventRow = (
  rowNr: number,
  row: string[],
  columnNames: string[],
  columnTypes: EventDataColumnType[],
  onWarning: (message: string) => void = noOp
) => {
  const columnCount = columnNames.length

  if (row.length !== columnCount || columnTypes.length !== columnCount) {
    onWarning(`Invalid number of columns in row: ${rowNr} (expected ${columnCount})`)
  }

  columnTypes.forEach((type, index) => {
    const value = row[index]

    switch (type) {
      case 'date':
      case 'timestamp':
        if (value === undefined || value === '' || value === null) {
          onWarning(`Invalid date or timestamp value '${value}' for column '${columnNames[index]}' in row: ${rowNr}`)
        }
        break
      default:
        break
    }
  })
}

export const isEventDataColumnType = (columnType: string): boolean =>
  EVENT_DATA_COLUMN_TYPES.includes(columnType as EventDataColumnType)
