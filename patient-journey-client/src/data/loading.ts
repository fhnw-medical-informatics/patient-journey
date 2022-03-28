import { EntityId } from './entities'
import { createPatientData, PatientData, PatientId } from './patients'
import { createEventData, EventData } from './events'
import * as csvParser from 'papaparse'
import { Alert } from '../alert/alertSlice'

export const PATIENT_DATA_FILE_URL = 'data/mock-patients.csv'
export const EVENT_DATA_FILE_URL = 'data/mock-events.csv'

export const DATA_LOADING_ERROR = 'Data Loading Error'

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
  try {
    const onAlert = (message: string) => onAddAlerts([{ topic: DATA_LOADING_ERROR, message }])
    const patientData = createPatientData(await parseFromUrl(patientDataUrl), onAlert)
    const eventData = createEventData(await parseFromUrl(eventDataUrl), onAlert)
    const data = { patientData, eventData }
    onLoadingDataComplete(data)
    const alerts = findDataInconsistencies(data)
    onAddAlerts(alerts)
  } catch (e: any) {
    console.error(DATA_LOADING_ERROR, e)
    onLoadingDataFailed(DATA_LOADING_ERROR)
    if (e.hasOwnProperty('statusTest') && e.hasOwnProperty('url')) {
      onAddAlerts([
        {
          topic: DATA_LOADING_ERROR,
          message: `${e.statusText} (${e.url})`,
        },
      ])
    } else {
      onAddAlerts([
        {
          topic: DATA_LOADING_ERROR,
          message: String(e),
        },
      ])
    }
  }
}

async function parseFromUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    return Promise.reject(response)
  }
  const csv = await response.text()
  return parseFromString(csv)
}

export const parseFromString = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true })
}

const findDataInconsistencies = ({ patientData, eventData }: LoadedData): ReadonlyArray<Alert> => {
  let alerts = []
  const pids = patientData.allEntities.map((p) => p.pid)
  const duplicatePatientIds = findDuplicateIds(pids)
  if (duplicatePatientIds.length > 0) {
    alerts.push({
      topic: DATA_LOADING_ERROR,
      message: `Patient table contains non-unique pid values: [${duplicatePatientIds}]`,
    })
  }
  const eids = eventData.allEntities.map((e) => e.eid)
  const duplicateEventIds = findDuplicateIds(eids)
  if (duplicateEventIds.length > 0) {
    alerts.push({
      topic: DATA_LOADING_ERROR,
      message: `Event table contains non-unique eid values: [${duplicateEventIds}]`,
    })
  }
  const pidRefs = eventData.allEntities.map((e) => e.pid)
  const nonMatchingPidRefs = findNonMatchingPidRefs(new Set(pids), pidRefs)
  if (nonMatchingPidRefs.length > 0) {
    alerts.push({
      topic: DATA_LOADING_ERROR,
      message: `Event table contains invalid pid references: [${nonMatchingPidRefs}]`,
    })
  }
  return alerts
}

const findDuplicateIds = (uids: ReadonlyArray<EntityId>): ReadonlyArray<EntityId> => [
  ...new Set(uids.filter((e, i, a) => a.indexOf(e) !== i)),
]

const findNonMatchingPidRefs = (knownPids: ReadonlySet<PatientId>, pidRefs: ReadonlyArray<PatientId>) => [
  ...new Set(pidRefs.filter((pidRef) => !knownPids.has(pidRef))),
]
