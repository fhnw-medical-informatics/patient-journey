import { DataEntity, Entity, EntityId } from './entities'
import { createPatientData, PatientData, PatientDataColumn, PatientId } from './patients'
import { createEventData, EventData, EventDataColumn } from './events'
import * as csvParser from 'papaparse'
import { Alert } from '../alert/alertSlice'

export const PATIENT_DATA_FILE_URL = 'data/patients.csv'
export const EVENT_DATA_FILE_URL = 'data/events.csv'

export const DATA_LOADING_ERROR = 'Data Loading Error'
export const DATA_LOADING_WARNING = 'Data Loading Warning'

const HEADER_ROW_COUNT = 2

export interface LoadedData {
  readonly patientData: PatientData
  readonly eventData: EventData
}

export const loadData = async (
  patientDataUrl: string,
  eventDataUrl: string,
  onLoadingDataInProgress: () => void,
  onLoadingDataComplete: (data: LoadedData) => void,
  onLoadingDataFailed: (message: string) => void,
  onAddAlerts: (alerts: ReadonlyArray<Alert>) => void
) => {
  onLoadingDataInProgress()
  const onWarning = (message: string) => onAddAlerts([{ type: 'warning', topic: DATA_LOADING_WARNING, message }])
  const onError = (message: string) => onAddAlerts([{ type: 'error', topic: DATA_LOADING_ERROR, message }])
  try {
    const patientData = createPatientData(await parseFromUrl(patientDataUrl, 'Patient'), HEADER_ROW_COUNT, onWarning)
    const eventData = createEventData(await parseFromUrl(eventDataUrl, 'Event'), HEADER_ROW_COUNT, onWarning)
    const data = { patientData, eventData }
    checkDataInconsistencies(data, onWarning)
    onLoadingDataComplete(data)
  } catch (e: any) {
    console.error(DATA_LOADING_ERROR, e)
    onLoadingDataFailed(DATA_LOADING_ERROR)
    onError(e.message)
  }
}

async function parseFromUrl(url: string, entityName: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.statusText} (${response.url})`)
  }
  const csv = await response.text()
  const result = parseFromString(csv)
  if (result.errors.length > 0) {
    throw new Error('Parsing errors: ' + result.errors.join('\n'))
  }
  if (result.data.length < HEADER_ROW_COUNT) {
    throw new Error(`${entityName} data table must contain two header rows (column names, column types).`)
  } else if (result.data.length === HEADER_ROW_COUNT) {
    throw new Error(`${entityName} data table must contain at least one row of data.`)
  } else {
    return result
  }
}

export const parseFromString = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true, delimiter: ',' })
}

const checkDataInconsistencies = (
  { patientData, eventData }: LoadedData,
  onWarning: (message: string) => void
): void => {
  const pids = patientData.allEntities.map((p) => p.pid)
  const duplicatePatientIds = findDuplicateIds(pids)
  if (duplicatePatientIds.length > 0) {
    onWarning(`Patient data table contains non-unique pid values: [${duplicatePatientIds}]`)
  }
  const eids = eventData.allEntities.map((e) => e.eid)
  const duplicateEventIds = findDuplicateIds(eids)
  if (duplicateEventIds.length > 0) {
    onWarning(`Event data table contains non-unique eid values: [${duplicateEventIds}]`)
  }
  const pidRefs = eventData.allEntities.map((e) => e.pid)
  const nonMatchingPidRefs = findNonMatchingPidRefs(new Set(pids), pidRefs)
  if (nonMatchingPidRefs.length > 0) {
    onWarning(`Event data table contains invalid pid references: [${nonMatchingPidRefs}]`)
  }
  checkDateFormats(patientData, 'Patient')
  checkDateFormats(eventData, 'Event')
}

// Checks that all date values of columns that are of type 'date' use the format dd.MM.yyyy
// If not, an error is thrown with the offending column name and row number.
const checkDateFormats = <T extends DataEntity<Entity, PatientDataColumn | EventDataColumn>>(
  data: T,
  entityName: string
): void => {
  const dateColumns = data.columns.filter((c) => c.type === 'date')

  for (const column of dateColumns) {
    const dateValues = data.allEntities.map((e) => e.values[column.index])

    for (let i = 0; i < dateValues.length; i++) {
      const dateValue = dateValues[i]
      if (dateValue && !/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
        throw new Error(
          `${entityName} - Invalid date format for column "${column.name}" in row ${
            i + HEADER_ROW_COUNT + 1
          } (${dateValue}). Dates must be in the format dd.MM.yyyy.`
        )
      }
    }
  }
}

const findDuplicateIds = (uids: ReadonlyArray<EntityId>): ReadonlyArray<EntityId> => [
  ...new Set(uids.filter((e, i, a) => a.indexOf(e) !== i)),
]

const findNonMatchingPidRefs = (knownPids: ReadonlySet<PatientId>, pidRefs: ReadonlyArray<PatientId>) => [
  ...new Set(pidRefs.filter((pidRef) => !knownPids.has(pidRef))),
]
