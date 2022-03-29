import { DataColumn, GenericColumnType } from './columns'
import { ParseResult } from 'papaparse'
import { DataEntity, Entity, EntityId, EntityIdNone } from './entities'
import { noOp } from '../utils'

export const PATIENT_ID_COLUMN_TYPE = 'pid'

export type PatientDataColumnType = typeof PATIENT_ID_COLUMN_TYPE | GenericColumnType
export type PatientDataColumn = DataColumn<PatientDataColumnType>

export interface Patient extends Entity {
  readonly type: 'patients'
  readonly pid: PatientId
}

enum PatientIdBrand {}

export type PatientId = PatientIdBrand & string
export const PatientIdNone = 'n/a' as PatientId

export interface PatientData extends DataEntity<Patient, PatientDataColumn> {}

export const EMPTY_PATIENT_DATA: PatientData = {
  type: 'patients',
  columns: [],
  allEntities: [],
  selectedEntity: EntityIdNone,
  hoveredEntity: EntityIdNone,
}

export const createPatientData = (
  result: ParseResult<string[]>,
  onWarning: (message: string) => void = noOp,
  onError: (message: string) => void = noOp
): PatientData => {
  const HEADER_ROW_COUNT = 2
  if (result.data.length < HEADER_ROW_COUNT) {
    onError('Patient data table must contain two header rows (column names, column types).')
    return EMPTY_PATIENT_DATA
  } else {
    const columnNames = result.data[0]
    const columnTypes = result.data[1].map((v) => v.toLowerCase())
    const idColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
    const isMissingIdColumn = idColumnIndex < 0

    if (isMissingIdColumn) {
      onWarning(
        `No '${PATIENT_ID_COLUMN_TYPE}' column type found in patient data table. Using row index to identify patients.`
      )
    }

    const columns = columnNames.map<PatientDataColumn>((name, index) => ({
      name,
      type: columnTypes[index] as PatientDataColumnType,
      index,
    }))

    return {
      ...EMPTY_PATIENT_DATA,
      columns,
      allEntities: result.data.slice(HEADER_ROW_COUNT).map((row: string[], index) => {
        const id = isMissingIdColumn ? String(index) : row[idColumnIndex]
        return {
          uid: id as EntityId,
          type: 'patients',
          pid: id as PatientId,
          values: row,
        }
      }),
    }
  }
}
