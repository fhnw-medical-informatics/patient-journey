import { PatientData, PatientDataColumn, PatientId } from '../patients'
import { EventData, EventDataColumn } from '../events'
import { DataEntity, Entity, EntityId } from '../entities'

export type CheckDataConsistencyWorkerData = Readonly<{
  headerRowCount: number
  patientData: PatientData
  eventData: EventData
}>

export type CheckDataConsistencyWorkerResponse =
  | Readonly<{
      type: 'warning'
      message: string
    }>
  | Readonly<{
      type: 'error'
      message: string
    }>
  | Readonly<{
      type: 'done'
    }>

const checkDataInconsistencies = (
  { patientData, eventData, headerRowCount }: CheckDataConsistencyWorkerData,
  onWarning: (message: string) => void,
  onError: (message: string) => void
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
  checkDateFormats(patientData, 'Patient', headerRowCount, onError)
  checkDateFormats(eventData, 'Event', headerRowCount, onError)
}

// Checks that all date values of columns that are of type 'date' use the format dd.MM.yyyy
// If not, an error is thrown with the offending column name and row number.
const checkDateFormats = <T extends DataEntity<Entity, PatientDataColumn | EventDataColumn>>(
  data: T,
  entityName: string,
  headerRowCount: number,
  onError: (message: string) => void
): void => {
  const dateColumns = data.columns.filter((c) => c.type === 'date')

  for (const column of dateColumns) {
    const dateValues = data.allEntities.map((e) => e.values[column.index])
    for (let i = 0; i < dateValues.length; i++) {
      const dateValue = dateValues[i]
      if (dateValue && !/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
        onError(
          `${entityName} - Invalid date format for column "${column.name}" in row ${
            i + headerRowCount + 1
          } (${dateValue}). Dates must be in the format dd.MM.yyyy.`
        )
        return
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

const createCheckDataConsistencyWorker = () => {
  onmessage = (e: MessageEvent<CheckDataConsistencyWorkerData>) => {
    const onMessage = (type: 'warning' | 'error') => (message: string) => {
      const response: CheckDataConsistencyWorkerResponse = { type, message }
      postMessage(response)
    }
    checkDataInconsistencies(e.data, onMessage('warning'), onMessage('error'))
    const done: CheckDataConsistencyWorkerResponse = {
      type: 'done',
    }
    postMessage(done)
  }
}

export default createCheckDataConsistencyWorker()
