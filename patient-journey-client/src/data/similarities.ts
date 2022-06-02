import * as csvParser from 'papaparse'

import { SIMILARITY_DATA_FILE_URL } from './loading'
import { PatientData, PatientId } from './patients'

import { getChunkSize } from '../utils'
import { scaleLinear } from 'd3-scale'

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
  totalNumberOfRows: number,
  patientId: PatientId,
  onLoadingDataComplete: (data: LoadedSimilarities) => void,
  onLoadingDataFailed: (message: string) => void
) => {
  let result: string[] = []

  // Get similarity file size
  const fileSize = await getRemoteFileSize(SIMILARITY_DATA_FILE_URL)
  // Get chunk size (chunk size should be great enough to contain multiple rows)
  const chunkSize = Math.round((fileSize / totalNumberOfRows) * 10)

  const [bytesFrom, bytesTo] = getByteRangeFromRowIndex(rowIndex, chunkSize, totalNumberOfRows, fileSize)

  const csvPart = await getRemoteFileChunk(SIMILARITY_DATA_FILE_URL, bytesFrom, bytesTo)

  csvParser.parse<Array<string>>(csvPart, {
    download: false,
    worker: true,
    complete: () => {
      onLoadingDataComplete({ similarities: result })
    },
    error: (error: any) => onLoadingDataFailed(error.message),
    step: (results, parser) => {
      if (results.data[0] === patientId) {
        result = results.data.slice(1)
        parser.abort()
      }
    },
    header: false,
    skipEmptyLines: true,
    delimiter: ',',
    fastMode: true,
  })
}

export const getByteRangeFromRowIndex = (
  rowIndex: number,
  chunkSize: number,
  totalRows: number,
  totalFileSize: number
): [number, number] => {
  if (chunkSize >= totalFileSize) {
    return [0, totalFileSize]
  }

  const rowToBytes = scaleLinear()
    .domain([0, totalRows - 1])
    .range([0, totalFileSize])

  const start = Math.floor(Math.max(rowToBytes(rowIndex) - chunkSize / 2, 0))
  const end = Math.ceil(Math.min(rowToBytes(rowIndex) + chunkSize / 2, totalFileSize))

  if (end - start < chunkSize && start > 0) {
    return [totalFileSize - chunkSize, totalFileSize]
  } else if (end - start < chunkSize && start === 0) {
    return [0, chunkSize]
  } else {
    return [start, end]
  }
}

const getRemoteFileSize = async (url: string) => {
  const res = await fetch(url, { headers: { Range: 'bytes=0-1' } })
  return +(res.headers.get('content-range')?.split('/')[1] ?? 0)
}

const getRemoteFileChunk = async (url: string, start: number, end: number) => {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } })
  return res.text()
}
