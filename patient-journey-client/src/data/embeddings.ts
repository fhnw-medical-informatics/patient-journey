import { encode } from '@nem035/gpt-3-encoder'

import { EventData } from './events'
import { PatientId, PatientData } from './patients'
import { openaiAPI } from '../utils/openai'
import { sha256 } from '../utils'

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
  embeddings: Record<PatientId, ReadonlyArray<number>>
}

export interface LoadedQueryEmbeddings {
  queryEmbeddings: ReadonlyArray<number>
}

export type EmbeddingsStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedEmbeddings

export type QueryEmbeddingsStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedQueryEmbeddings

export type EmbeddingsData = {
  readonly patientDataEmbeddings:
    | EmbeddingsStateLoadingPending
    | EmbeddingsStateLoadingInProgress
    | EmbeddingsStateLoadingFailed
    | EmbeddingsStateLoadingComplete
  readonly queryEmbeddings:
    | EmbeddingsStateLoadingPending
    | EmbeddingsStateLoadingInProgress
    | EmbeddingsStateLoadingFailed
    | QueryEmbeddingsStateLoadingComplete
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

async function retryOpenaiAPI(maxRetries: number, inputChunk: Array<string>) {
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
  const cachedEmbeddings = localStorage.getItem(patientDataHash)

  if (cachedEmbeddings) {
    console.log('Embeddings loaded from cache in local storage')

    const embeddings = JSON.parse(cachedEmbeddings)

    console.log('Embeddings', embeddings)

    return Promise.resolve({
      patientDataEmbeddings: {
        type: 'loading-complete',
        embeddings,
      },
      queryEmbeddings: {
        type: 'loading-pending',
      },
    })
  } else {
    const patientJourneys = preparePatientJourneys(patientData, eventData)

    const { totalNrOfTokens, patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, 8191)

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
            queryEmbeddings: {
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
          queryEmbeddings: {
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
        queryEmbeddings: {
          type: 'loading-pending',
        },
      }
    }

    const patientDataEmbeddings: Record<string, ReadonlyArray<number>> = {}

    patientData.allEntities.forEach((patient, idx) => {
      patientDataEmbeddings[patient.pid] = patientJourneyEmbeddings[idx]
    })

    // Cache embeddings in local storage
    // TODO:
    // Data Loading Error DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'e1b0725a92521a43a327b5a5890be77c9aff96299ed6904e72749aa566b0a377' exceeded the quota.
    localStorage.setItem(patientDataHash, JSON.stringify(patientDataEmbeddings))

    console.log('Embeddings cached successfully')

    console.log('Embeddings', patientDataEmbeddings)

    return Promise.resolve({
      patientDataEmbeddings: {
        type: 'loading-complete',
        embeddings: patientDataEmbeddings,
      },
      queryEmbeddings: {
        type: 'loading-pending',
      },
    })
  }
}
