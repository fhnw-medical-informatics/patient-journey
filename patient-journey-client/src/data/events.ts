import { DataColumn, GenericColumnType } from './columns'
import { PATIENT_ID_COLUMN_TYPE, PatientId } from './patients'
import { ParseResult } from 'papaparse'

export const EVENT_ID_COLUMN_TYPE = 'eid'

export type EventDataColumnType = typeof EVENT_ID_COLUMN_TYPE | typeof PATIENT_ID_COLUMN_TYPE | GenericColumnType
export type EventDataColumn = DataColumn<EventDataColumnType>

enum EventIdBrand {}

export type EventId = EventIdBrand & string
export const EventIdNone = 'n/a' as EventId

export interface PatientJourneyEvent {
  readonly eid: EventId
  readonly pid: PatientId
  readonly values: ReadonlyArray<string>
}

export interface EventData {
  readonly columns: ReadonlyArray<EventDataColumn>
  readonly allEvents: ReadonlyArray<PatientJourneyEvent>
}

export const EMPTY_EVENT_DATA: EventData = {
  columns: [],
  allEvents: [],
}

export const createEventData = (result: ParseResult<string[]>): EventData => {
  const HEADER_ROW_COUNT = 2
  if (result.data.length < HEADER_ROW_COUNT) {
    return EMPTY_EVENT_DATA
  } else {
    const columnNames = result.data[0]
    const columnTypes = result.data[1].map((v) => v.toLowerCase())
    const eventIdColumnIndex = columnTypes.indexOf(EVENT_ID_COLUMN_TYPE)
    const patientIdColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
    const columns = columnNames.map<EventDataColumn>((name, index) => ({
      name,
      type: columnTypes[index] as EventDataColumnType,
      index,
    }))
    return {
      ...EMPTY_EVENT_DATA,
      columns,
      allEvents: result.data.slice(HEADER_ROW_COUNT).map((row: string[]) => {
        return {
          eid: row[eventIdColumnIndex] as EventId,
          pid: row[patientIdColumnIndex] as PatientId,
          values: row,
        }
      }),
    }
  }
}
