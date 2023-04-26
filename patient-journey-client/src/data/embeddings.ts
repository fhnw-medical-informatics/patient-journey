import { encode } from '@nem035/gpt-3-encoder'

import { EventData } from './events'
import { PatientData } from './patients'
import { openaiAPI } from '../utils/openai'
import { sha256 } from '../utils'
import { EMBEDDINGS_DATA_FILE_URL } from './constants'

export type Embeddings = Record<string, ReadonlyArray<number>>

export type EmbeddingsFile = { patientDataHash: string; embeddings: Embeddings }

export type EmbeddingsStateLoadingPending = Readonly<{
  type: 'loading-pending'
}>

export type EmbeddingsStateLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}>

export type EmbeddingsStateLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export interface LoadedEmbeddings {
  embeddings: Embeddings
}

export interface LoadedPromptEmbeddings {
  embedding: number[]
}

export type EmbeddingsStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedEmbeddings

export type PromptEmbeddingsStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedPromptEmbeddings

export type EmbeddingsData = {
  readonly patientDataEmbeddings:
    | EmbeddingsStateLoadingPending
    | EmbeddingsStateLoadingInProgress
    | EmbeddingsStateLoadingFailed
    | EmbeddingsStateLoadingComplete
  readonly promptEmbeddings:
    | EmbeddingsStateLoadingPending
    | EmbeddingsStateLoadingInProgress
    | EmbeddingsStateLoadingFailed
    | PromptEmbeddingsStateLoadingComplete
}

export const preparePatientJourneys = (patientData: PatientData, eventData: EventData): Array<string> =>
  patientData.allEntities.map((patient) => {
    const events = eventData.allEntities.filter((event) => event.pid === patient.pid)

    return `
    Patient information:
      ${patientData.columns.map((column) => `${column.name}: ${patient.values[column.index]}`).join('\n')}

    The patients' journey through the hospital:
      ${events
        .map(
          (event, idx) =>
            `Event ${idx + 1}: ${eventData.columns
              .map((column) => `${column.name}: ${event.values[column.index]}`)
              .join(', ')}`
        )
        .join('\n')}
   `
  })

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retryOpenaiAPI(maxRetries: number, inputChunk: Array<string>) {
  const baseWaitTime = 30000 / 2 ** (maxRetries - 1)

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openaiAPI.createEmbedding({
        model: 'text-embedding-ada-002',
        input: inputChunk,
      })

      return response
    } catch (error) {
      console.error(`Error in retry ${i + 1}:`, error)

      if (i === maxRetries - 1) {
        throw error
      }

      const waitTime = Math.random() * 2 ** i * baseWaitTime
      await delay(waitTime)
    }
  }
}

/**
 * Create chunks of patient journeys to be sent to the openai embeddings api.
 * Each chunk is an array of patient journeys (strings) that are in total less
 * than or equal to maxTokensPerChunk.
 *
 * The openai embeddings api has a limit of 8191 tokens per request. The number of
 * tokens for a string can be calculated with the gpt-3-encoder package.
 *
 * @param journeys
 * @param maxTokensPerChunk
 */
export const createPatientJourneysChunks = (
  journeys: Array<string>,
  maxTokensPerChunk: number
): { totalNrOfTokens: number; patientJourneyChunks: Array<Array<string>> } => {
  const chunks: Array<Array<string>> = []
  let totalNrOfTokens = 0
  let currentChunk: string[] = []
  let currentChunkTokens = 0

  journeys.forEach((journey, idx) => {
    let journeyString = journey
    let journeyTokens = encode(journeyString).length

    // If a single journey is longer than the max number of tokens per chunk, shrink it until it fits
    if (journeyTokens > maxTokensPerChunk) {
      console.warn(
        `Patient journey ${idx} is longer than the max number of tokens per chunk. It has ${journeyTokens} tokens.`
      )

      while (journeyTokens > maxTokensPerChunk) {
        journeyString = journeyString.slice(0, -1000)
        journeyTokens = encode(journeyString).length
      }

      console.warn(
        `Patient journey ${idx} was longer than the max number of tokens per chunk. It was shrunk to fit. Now it has ${journeyTokens} tokens.`
      )
    }

    if (currentChunkTokens + journeyTokens > maxTokensPerChunk) {
      chunks.push(currentChunk)
      currentChunk = []
      currentChunkTokens = 0
    }

    currentChunk.push(journeyString)
    currentChunkTokens += journeyTokens
    totalNrOfTokens += journeyTokens
  })

  if (currentChunkTokens > 0) {
    chunks.push(currentChunk)
  }

  return {
    totalNrOfTokens,
    patientJourneyChunks: chunks,
  }
}

export const loadEmbeddings = async (patientData: PatientData, eventData: EventData): Promise<EmbeddingsData> => {
  const patientDataHash = await sha256(JSON.stringify(patientData.allEntities))

  // Check if embeddings are already cached in local storage
  const cachedEmbeddingsFile = await loadEmbeddingsFileFromUrl(EMBEDDINGS_DATA_FILE_URL)

  if (cachedEmbeddingsFile && cachedEmbeddingsFile.patientDataHash === patientDataHash) {
    console.log('Embeddings loaded from cache in local storage')

    const embeddings = cachedEmbeddingsFile.embeddings

    console.log('Embeddings', embeddings)

    return Promise.resolve({
      patientDataEmbeddings: {
        type: 'loading-complete',
        embeddings,
      },
      promptEmbeddings: {
        type: 'loading-pending',
      },
    })
  } else {
    if (cachedEmbeddingsFile && cachedEmbeddingsFile.patientDataHash !== patientDataHash) {
      console.log('Cached embeddings are for a different patient data set, loading new embeddings from API')
    }

    const patientJourneys = preparePatientJourneys(patientData, eventData)

    const { totalNrOfTokens, patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, 6000) // 8191 is the max number of tokens per request (but encode library does not seem to be exact)

    console.log('Total number of tokens:', totalNrOfTokens)
    console.log('Number of chunks:', patientJourneyChunks.length)
    console.log('Number of patient Journeys', patientJourneys.length)

    const costPer1KTokens = 0.0004

    console.log('Estimated cost:', (totalNrOfTokens / 1000) * costPer1KTokens)

    const patientJourneyEmbeddings: Array<Array<number>> = []

    for (const [chunkIdx, chunk] of patientJourneyChunks.entries()) {
      console.log(`Sending chunk ${chunkIdx + 1} of ${patientJourneyChunks.length} to openai embeddings api`)

      try {
        const chunkEmbeddings = await retryOpenaiAPI(3, chunk)

        if (chunkEmbeddings && chunkEmbeddings.data.data.length > 0) {
          chunkEmbeddings.data.data.forEach((embedding) => {
            patientJourneyEmbeddings.push(embedding.embedding)
          })
        } else {
          console.error(`Failed to get embeddings for chunk ${chunkIdx + 1}`)

          return {
            patientDataEmbeddings: {
              type: 'loading-failed',
              errorMessage: 'Something went wrong while loading the embeddings',
            },
            promptEmbeddings: {
              type: 'loading-pending',
            },
          }
        }
      } catch (error) {
        console.error(`Failed to get embeddings for chunk ${chunkIdx + 1} after 3 retries`, error)

        return {
          patientDataEmbeddings: {
            type: 'loading-failed',
            errorMessage: 'Something went wrong while loading the embeddings',
          },
          promptEmbeddings: {
            type: 'loading-pending',
          },
        }
      }
    }

    console.log('Number of patient journey embeddings:', patientJourneyEmbeddings.length)

    if (patientJourneyEmbeddings.length !== patientData.allEntities.length) {
      console.error(
        'Number of patient journey embeddings does not match number of patient journeys. Something went wrong.'
      )

      return {
        patientDataEmbeddings: {
          type: 'loading-failed',
          errorMessage: 'Something went wrong while loading the embeddings',
        },
        promptEmbeddings: {
          type: 'loading-pending',
        },
      }
    }

    const patientDataEmbeddings: Embeddings = {}

    patientData.allEntities.forEach((patient, idx) => {
      patientDataEmbeddings[patient.pid] = patientJourneyEmbeddings[idx]
    })

    // Download embeddings as json file and prompt user to save it
    const blob = new Blob([JSON.stringify({ patientDataHash, embeddings: patientDataEmbeddings })], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    console.log('Download embeddings as json file:', url)
    // <a href="blob:http://127.0.0.1:3000/77094bbb-5b03-4391-92dc-42796fd8ba3d" download="embeddings.json">Download</a>

    console.log('Embeddings cached successfully')

    console.log('Embeddings', patientDataEmbeddings)

    return Promise.resolve({
      patientDataEmbeddings: {
        type: 'loading-complete',
        embeddings: patientDataEmbeddings,
      },
      promptEmbeddings: {
        type: 'loading-pending',
      },
    })
  }
}

const loadEmbeddingsFileFromUrl = async (url: string): Promise<EmbeddingsFile | undefined> => {
  const response = await fetch(url)

  if (response.ok) {
    const json = await response.json()

    return json
  } else {
    return undefined
  }
}
