import { EventData } from './events'
import { PatientId, PatientData } from './patients'

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

export const loadEmbeddings = async (patientData: PatientData, eventData: EventData): Promise<EmbeddingsData> => {
  return Promise.resolve({
    patientDataEmbeddings: {
      type: 'loading-pending',
    },
    queryEmbeddings: {
      type: 'loading-pending',
    },
  })
}
