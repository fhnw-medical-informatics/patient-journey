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

export const parseSpecificRowFromSimilarityFile = (
  rowIndex: number,
  onLoadingDataComplete: (data: LoadedSimilarities) => void,
  onLoadingDataFailed: (message: string) => void
) => {
  let currentRow = 0
  let result: string[] = []

  csvParser.parse<Array<string>>(`${window.location.href}${SIMILARITY_DATA_FILE_URL}`, {
    download: true,
    worker: true,
    complete: () => {
      onLoadingDataComplete({ similarities: result })
    },
    error: (error) => onLoadingDataFailed(error.message),
    step: (results, parser) => {
      if (currentRow === rowIndex) {
        result = results.data
        parser.abort()
      } else {
        currentRow++
      }
    },
  })
}
