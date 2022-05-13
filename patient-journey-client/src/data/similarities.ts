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
  allKnownPatientIds: ReadonlyArray<PatientId>,
  data: ReadonlyArray<string[]>,
  onWarning: (message: string) => void = noOp
): SimilarityData => {
  const similarityData: Mutable<SimilarityData> = {}
  const indexPatients = data.length > 0 ? data[0].slice(1).map((v) => v as PatientId) : []

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

  const incompletePatientIds: PatientId[] = []

  // initialize missing data to empty string
  allKnownPatientIds.forEach((indexPatient) => {
    let values: Mutable<SimilarityValues> = similarityData[indexPatient]

    // missing index patient columns
    if (!values) {
      incompletePatientIds.push(indexPatient)
      values = { indexPatient }
      similarityData[indexPatient] = values
    }

    // missing other patient values
    allKnownPatientIds.forEach((otherPatient) => {
      if (!values.hasOwnProperty(otherPatient)) {
        incompletePatientIds.push(otherPatient)
        values[otherPatient] = ''
      }
    })
  })

  if (incompletePatientIds.length > 0) {
    // using a set would seem easier, but we want to keep original order
    const uniqueIncompletePatientIds = incompletePatientIds.filter((v, i, a) => a.indexOf(v) === i)
    onWarning(`Incomplete similarity matrix for patient IDs ${uniqueIncompletePatientIds}`)
  }

  return similarityData
}
