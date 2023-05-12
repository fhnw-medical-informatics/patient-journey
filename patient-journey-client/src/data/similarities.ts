import * as csvParser from 'papaparse'

import { SIMILARITY_DATA_FILE_URL } from './constants'
import { PatientData, PatientId } from './patients'

import { scaleLinear } from 'd3-scale'
import { DataLoadingComplete, DataLoadingFailed, DataLoadingInProgress, DataLoadingPending } from './types'

export type SimilaritiesStateLoadingPending = DataLoadingPending

export type SimilaritiesStateLoadingInProgress = DataLoadingInProgress

export type SimilaritiesStateLoadingFailed = DataLoadingFailed

export interface LoadedSimilarities {
  similarities: Array<string>
}

export type SimilaritiesStateLoadingComplete = DataLoadingComplete<LoadedSimilarities>

export type SimilarityData = {
  readonly patientIdMap: Record<string, number>
  readonly indexPatientSimilarities:
    | SimilaritiesStateLoadingPending
    | SimilaritiesStateLoadingInProgress
    | SimilaritiesStateLoadingFailed
    | SimilaritiesStateLoadingComplete
}

export const createPatientIdToSimilarityIndexMap = (patients: PatientData['allEntities']): Record<string, number> => {
  const patientIdMap: Record<string, number> = {}
  patients.forEach((patient, i) => {
    patientIdMap[patient.pid] = i
  })
  return patientIdMap
}

export const parseSpecificRowFromSimilarityFile = async (
  rowIndex: number,
  totalNumberOfRows: number,
  patientId: PatientId,
  onLoadingDataComplete: (data: LoadedSimilarities) => void,
  onLoadingDataWarning: (message: string) => void,
  onLoadingDataFailed: (message: string) => void
) => {
  let result: string[] = []

  // Get similarity file size
  const fileSize = await getRemoteFileSize(SIMILARITY_DATA_FILE_URL)

  if (fileSize === undefined) {
    onLoadingDataFailed(
      `Similarity file '${SIMILARITY_DATA_FILE_URL}' is missing or your web server does not support range requests. If you have provided a similarity file, please use a web server that supports HTTP range requests like RangeHTTPServer (https://pypi.org/project/rangehttpserver/) for python or 'npx serve' for node.js.`
    )
  } else if (fileSize > 0) {
    // 1 Char = 1 Byte and we have a patientId for each row (+ 1 for the comma per column)
    // Assuming that each patientId is equal in length
    const estimatedHeaderRowBytesSize = (`${patientId}`.length + 1) * totalNumberOfRows

    // Get chunk size (chunk size should be great enough to contain multiple rows)
    const chunkSize = Math.min(
      Math.round(((fileSize - estimatedHeaderRowBytesSize) / totalNumberOfRows) * 10),
      fileSize
    )

    const [bytesFrom, bytesTo] = getByteRangeFromRowIndex(
      rowIndex,
      chunkSize,
      totalNumberOfRows,
      // fileSize - 1 because content-length is inclusive of the last byte
      fileSize - 1,
      // Skip header row bytes because header row is much larger than the rest
      // if patientId's are longer strings, which would cause the range
      // to be shifted otherwise
      estimatedHeaderRowBytesSize
    )

    const csvPart = await getRemoteFileChunk(SIMILARITY_DATA_FILE_URL, bytesFrom, bytesTo)

    csvParser.parse<Array<string>>(csvPart, {
      download: false,
      worker: true,
      complete: () => {
        if (result.length === totalNumberOfRows) {
          onLoadingDataComplete({ similarities: result })
        } else {
          onLoadingDataFailed(
            `Similarity file is incomplete. Expected ${totalNumberOfRows} similarity scores for ${patientId}, but got ${result.length}.`
          )
        }
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
  } else {
    onLoadingDataWarning(
      `Similarity file '${SIMILARITY_DATA_FILE_URL}' is empty. Consider not using the similarity functionality or provide a valid similarity file.`
    )
    onLoadingDataComplete({ similarities: result })
  }
}

export const getByteRangeFromRowIndex = (
  rowIndex: number,
  chunkSize: number,
  totalRows: number,
  totalFileSize: number,
  skipBytes: number = 0
): [number, number] => {
  if (chunkSize >= totalFileSize) {
    return [0, totalFileSize]
  }

  const rowToBytes = scaleLinear()
    .domain([0, totalRows - 1])
    .range([skipBytes, totalFileSize])

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
  const rangeHeader = res.headers.get('content-range')

  if (rangeHeader) {
    const fileSize = rangeHeader.split('/')[1]
    return +fileSize
  } else {
    return undefined
  }
}

const getRemoteFileChunk = async (url: string, start: number, end: number) => {
  const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } })
  return res.text()
}
