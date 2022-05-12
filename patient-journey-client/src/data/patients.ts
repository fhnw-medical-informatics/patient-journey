import { DataColumn, GENERIC_COLUMN_TYPES } from './columns'
import { DataEntity, Entity, EntityId } from './entities'
import { noOp } from '../utils'

export const PATIENT_ID_COLUMN_TYPE = 'pid' as const

export const PATIENT_DATA_COLUMN_TYPES = [...GENERIC_COLUMN_TYPES, PATIENT_ID_COLUMN_TYPE]
export type PatientDataColumnType = typeof PATIENT_DATA_COLUMN_TYPES[number]

export type PatientDataColumn = DataColumn<PatientDataColumnType>

export interface Patient extends Entity {
  readonly pid: PatientId
}

enum PatientIdBrand {}

export type PatientId = PatientIdBrand & string
export const PatientIdNone = 'n/a' as PatientId

export interface PatientData extends DataEntity<Patient, PatientDataColumn> {}

export const EMPTY_PATIENT_DATA: PatientData = {
  columns: [],
  allEntities: [],
}

export const createPatientData = (
  data: ReadonlyArray<string[]>,
  headerRowCount: number,
  onWarning: (message: string) => void = noOp
): PatientData => {
  const columnNames = data[0]
  const columnTypes = data[1].map((v) => v.toLowerCase())
  const idColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
  const isMissingIdColumn = idColumnIndex < 0

  if (isMissingIdColumn) {
    onWarning(
      `No '${PATIENT_ID_COLUMN_TYPE}' column type found in patient data table. Using row index to identify patients.`
    )
  }

  columnTypes.forEach((type) => {
    if (!isPatientDataColumnType(type)) {
      onWarning(`Invalid column type '${type}' found in patient data table. Falling back to 'string'.`)
    }
  })

  const columns = columnNames.map<PatientDataColumn>((name, index) => ({
    name,
    type: columnTypes[index] as PatientDataColumnType,
    index,
  }))

  return {
    ...EMPTY_PATIENT_DATA,
    columns,
    allEntities: data.slice(headerRowCount).map((row: string[], index) => {
      const id = isMissingIdColumn ? String(index) : row[idColumnIndex]
      return {
        uid: id as EntityId,
        pid: id as PatientId,
        values: row,
      }
    }),
  }
}

export const isPatientDataColumnType = (columnType: string): boolean =>
  PATIENT_DATA_COLUMN_TYPES.includes(columnType as PatientDataColumnType)
