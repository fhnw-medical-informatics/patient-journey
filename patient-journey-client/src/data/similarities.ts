import * as csvParser from 'papaparse'

import { SIMILARITY_DATA_FILE_URL } from './loading'

export type SimilarityData = ReadonlyArray<string>

export const parseSpecificRowFromSimilarityFile = async (rowIndex: number): Promise<SimilarityData> =>
  new Promise((resolve, reject) => {
    let currentRow = 0

    csvParser.parse<SimilarityData>(`${window.location.href}${SIMILARITY_DATA_FILE_URL}`, {
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
