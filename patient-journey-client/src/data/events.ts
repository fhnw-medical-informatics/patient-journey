import { DataColumn, GenericColumnType } from './columns'
import { PATIENT_ID_COLUMN_TYPE, PatientId } from './patients'
import { ParseResult } from 'papaparse'
import { DataEntity, Entity, EntityId, EntityIdNone } from './entities'
import { noOp } from '../utils'

export const EVENT_ID_COLUMN_TYPE = 'eid'

export type EventDataColumnType = typeof EVENT_ID_COLUMN_TYPE | typeof PATIENT_ID_COLUMN_TYPE | GenericColumnType
export type EventDataColumn = DataColumn<EventDataColumnType>

enum EventIdBrand {}

export type EventId = EventIdBrand & string

export interface PatientJourneyEvent extends Entity {
  readonly type: 'events'
  readonly eid: EventId
  readonly pid: PatientId
}

export interface EventData extends DataEntity<PatientJourneyEvent, EventDataColumn> {}

export const EMPTY_EVENT_DATA: EventData = {
  columns: [],
  allEntities: [],
  selectedEntity: EntityIdNone,
  hoveredEntity: EntityIdNone,
}

export const createEventData = (
  result: ParseResult<string[]>,
  onWarning: (message: string) => void = noOp,
  onError: (message: string) => void = noOp
): EventData => {
  const HEADER_ROW_COUNT = 2
  if (result.data.length < HEADER_ROW_COUNT) {
    onError('Event data table must contain two header rows (column names, column types).')
    return EMPTY_EVENT_DATA
  } else {
    const columnNames = result.data[0]
    const columnTypes = result.data[1].map((v) => v.toLowerCase())
    const eventIdColumnIndex = columnTypes.indexOf(EVENT_ID_COLUMN_TYPE)
    const isMissingEventIdColumn = eventIdColumnIndex < 0

    if (isMissingEventIdColumn) {
      onWarning(
        `No '${EVENT_ID_COLUMN_TYPE}' column type found in event data table. Using row index to identify events.`
      )
    }

    const patientIdColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
    const columns = columnNames.map<EventDataColumn>((name, index) => ({
      name,
      type: columnTypes[index] as EventDataColumnType,
      index,
    }))
    return {
      ...EMPTY_EVENT_DATA,
      columns,
      allEntities: result.data.slice(HEADER_ROW_COUNT).map((row: string[], index) => {
        const id = isMissingEventIdColumn ? String(index) : row[eventIdColumnIndex]
        return {
          uid: id as EntityId,
          type: 'events',
          eid: id as EventId,
          pid: row[patientIdColumnIndex] as PatientId,
          values: row,
        }
      }),
    }
  }
}
