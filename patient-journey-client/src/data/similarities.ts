import * as csvParser from 'papaparse'

import { SIMILARITY_DATA_FILE_URL } from './loading'
import { PatientData, PatientId } from './patients'

import { getChunkSize } from '../utils'

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

export const parseSpecificRowFromSimilarityFile = async (
  rowIndex: number,
  onLoadingDataComplete: (data: LoadedSimilarities) => void,
  onLoadingDataFailed: (message: string) => void
) => {
  let currentRow = 0
  let result: string[] = []

  // Avoid this bug: https://github.com/mholt/PapaParse/issues/831
  const fileSize = await getRemoteFileSize(SIMILARITY_DATA_FILE_URL)
  const chunkSize = getChunkSize(fileSize, 500)

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
    header: false,
    skipEmptyLines: true,
    delimiter: ',',
    fastMode: true,
    chunkSize,
  })
}

const getRemoteFileSize = async (url: string) => {
  const res = await fetch(url, { headers: { Range: 'bytes=0-1' } })
  return +(res.headers.get('content-range')?.split('/')[1] ?? 0)
}
