import { DataColumn, GenericColumnType } from './columns'
import { ParseResult } from 'papaparse'

export const PATIENT_ID_COLUMN_TYPE = 'pid'

export type PatientDataColumnType = typeof PATIENT_ID_COLUMN_TYPE | GenericColumnType
export type PatientDataColumn = DataColumn<PatientDataColumnType>

export interface Patient {
  readonly pid: PatientId
  readonly values: ReadonlyArray<string>
}

enum PatientIdBrand {}

export type PatientId = PatientIdBrand & string
export const PatientIdNone = 'n/a' as PatientId

export interface PatientData {
  readonly type: 'patients'
  readonly columns: ReadonlyArray<PatientDataColumn>
  readonly allPatients: ReadonlyArray<Patient>
  readonly selectedPatient: PatientId
  readonly hoveredPatient: PatientId
}

export const EMPTY_PATIENT_DATA: PatientData = {
  type: 'patients',
  columns: [],
  allPatients: [],
  selectedPatient: PatientIdNone,
  hoveredPatient: PatientIdNone,
}

export const createPatientData = (result: ParseResult<string[]>): PatientData => {
  const HEADER_ROW_COUNT = 2
  if (result.data.length < HEADER_ROW_COUNT) {
    return EMPTY_PATIENT_DATA
  } else {
    const columnNames = result.data[0]
    const columnTypes = result.data[1].map((v) => v.toLowerCase())
    const idColumnIndex = columnTypes.indexOf(PATIENT_ID_COLUMN_TYPE)
    const columns = columnNames.map<PatientDataColumn>((name, index) => ({
      name,
      type: columnTypes[index] as PatientDataColumnType,
      index,
    }))
    return {
      ...EMPTY_PATIENT_DATA,
      columns,
      allPatients: result.data.slice(HEADER_ROW_COUNT).map((row: string[]) => {
        return {
          pid: row[idColumnIndex] as PatientId,
          values: row,
        }
      }),
    }
  }
}
