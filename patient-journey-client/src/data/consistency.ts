import { PatientData, PatientDataColumn, PatientId } from './patients'
import { EventData, EventDataColumn } from './events'
import { DataEntity, Entity, EntityId } from './entities'

export const HEADER_ROW_COUNT = 2

export type ConsistencyCheckData = Readonly<{
  patientData: PatientData
  eventData: EventData
}>

export const checkDataConsistency = (
  { patientData, eventData }: ConsistencyCheckData,
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
  checkDateFormats(patientData, 'Patient', HEADER_ROW_COUNT)
  checkDateFormats(eventData, 'Event', HEADER_ROW_COUNT)
}

// Checks that all date values of columns that are of type 'date' use the format dd.MM.yyyy
// If not, an error is reported with the offending column name and row number.
const checkDateFormats = <T extends DataEntity<Entity, PatientDataColumn | EventDataColumn>>(
  data: T,
  entityName: string,
  headerRowCount: number
): void => {
  const dateColumns = data.columns.filter((c) => c.type === 'date')

  for (const column of dateColumns) {
    const dateValues = data.allEntities.map((e) => e.values[column.index])
    for (let i = 0; i < dateValues.length; i++) {
      const dateValue = dateValues[i]
      if (dateValue && !/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
        throw Error(
          `${entityName} - Invalid date format for column "${column.name}" in row ${
            i + headerRowCount + 1
          } (${dateValue}). Dates must be in the format dd.MM.yyyy.`
        )
      }
    }
  }
}

const findDuplicateIds = (uids: ReadonlyArray<EntityId>): ReadonlyArray<EntityId> => {
  const sortedUids = [...uids].sort()
  const duplicateUids: Array<EntityId> = []
  for (let i = 0; i < sortedUids.length - 1; i++) {
    if (sortedUids[i] === sortedUids[i + 1]) {
      duplicateUids.push(sortedUids[i])
    }
  }
  return duplicateUids
}

const findNonMatchingPidRefs = (knownPids: ReadonlySet<PatientId>, pidRefs: ReadonlyArray<PatientId>) => [
  ...new Set(pidRefs.filter((pidRef) => !knownPids.has(pidRef))),
]
