import { PatientId } from './patients'
import { noOp } from '../utils'

// https://github.com/microsoft/TypeScript/issues/24509
declare type Mutable<T extends object> = {
  -readonly [K in keyof T]: T[K]
}

export interface SimilarityData {
  readonly [indexPatientId: string]: SimilarityValues
}

export interface SimilarityValues {
  readonly indexPatient: PatientId
  readonly [otherPatientId: string]: string // store exactly as imported, convert to number later (like we do for patient/event entities)
}

export const createSimilarityData = (
  data: ReadonlyArray<string[]>,
  _onWarning: (message: string) => void = noOp
): SimilarityData => {
  const similarityData: Mutable<SimilarityData> = {}
  const indexPatients = data[0].slice(1).map((v) => v as PatientId)

  indexPatients.forEach((indexPatient, columnIndex) => {
    similarityData[indexPatient] = {
      indexPatient,
    }
    data.slice(1).forEach((rowValues) => {
      const otherPatient = rowValues[0]
      const similarityValues: Mutable<SimilarityValues> = similarityData[indexPatient]
      similarityValues[otherPatient] = rowValues[columnIndex + 1]
    })
  })

  // TODO: Assert matrix completeness (all known patient ids)
  return similarityData
}
