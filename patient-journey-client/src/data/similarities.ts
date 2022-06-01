import * as csvParser from 'papaparse'

import { SIMILARITY_DATA_FILE_URL } from './loading'
import { PatientData, PatientId } from './patients'

export type SimilaritiesStateLoadingPending = Readonly<{
  type: 'loading-pending'
}>

export type SimilaritiesStateLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}>

export type SimilaritiesStateLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export interface LoadedSimilarities {
  similarities: Array<string>
}

export type SimilaritiesStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedSimilarities

export type SimilarityData = {
  readonly patientIdMap: Map<PatientId, number>
  readonly indexPatientSimilarities:
    | SimilaritiesStateLoadingPending
    | SimilaritiesStateLoadingInProgress
    | SimilaritiesStateLoadingFailed
    | SimilaritiesStateLoadingComplete
}

export const createPatientIdToSimilarityIndexMap = (patients: PatientData['allEntities']): Map<PatientId, number> =>
  new Map<PatientId, number>(patients.map((p, idx) => [p.pid, idx]))

export const parseSpecificRowFromSimilarityFile = async (rowIndex: number): Promise<ReadonlyArray<string>> =>
  new Promise((resolve, reject) => {
    let currentRow = 0

    csvParser.parse<ReadonlyArray<string>>(`${window.location.href}${SIMILARITY_DATA_FILE_URL}`, {
      download: true,
      worker: true,
      complete: () => {},
      error: (error) => reject(error),
      step: (results, parser) => {
        if (currentRow === rowIndex) {
          resolve(results.data)
          parser.abort()
        } else {
          currentRow++
        }
      },
    })
  })
