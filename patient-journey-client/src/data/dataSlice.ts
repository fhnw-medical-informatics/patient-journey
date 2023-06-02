import { AnyAction, createAsyncThunk, createSlice, Draft, freeze, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'

import { GenericFilter } from './filtering'
import { EntityId, EntityIdNone, EntityType } from './entities'
import { loadData as loadDataImpl, LoadedData, LoadingProgress } from './loading'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './constants'
import { addAlerts } from '../alert/alertSlice'
import { Patient, PatientId, PatientIdNone } from './patients'
import { LoadedSimilarities, parseSpecificRowFromSimilarityFile } from './similarities'
import {
  createPatientJourneysChunks,
  EmbeddingsData,
  preparePatientJourneys,
  retryOpenaiAPI,
  //TOKENS_PER_CHUNK,
} from './embeddings'
import { openaiAPI } from '../utils/openai'

import { DataLoadingComplete, DataLoadingFailed, DataLoadingInProgress, DataLoadingPending } from './types'

type DataStateLoadingPending = DataLoadingPending

type DataStateLoadingInProgress = DataLoadingInProgress & LoadingProgress

export type DataStateLoadingFailed = DataLoadingFailed

export type DataStateLoadingComplete = DataLoadingComplete<
  LoadedData &
    ActiveDataView &
    Filters &
    Hovering &
    Selection &
    IndexPatient &
    SplitPane &
    SimilarityPrompt &
    Cohort &
    CohortExplanation
>

export const ACTIVE_DATA_VIEWS = ['patients', 'events'] as const
export type ActiveDataViewType = typeof ACTIVE_DATA_VIEWS[number]

interface ActiveDataView {
  readonly view: ActiveDataViewType
}

interface Filters {
  readonly filters: ReadonlyArray<GenericFilter>
}

export interface FocusEntity {
  readonly type: EntityType | 'none'
  readonly uid: EntityId
}

const FOCUS_ENTITY_NONE: FocusEntity = { type: 'none', uid: EntityIdNone }

interface Hovering {
  readonly hovered: FocusEntity
}

interface Selection {
  readonly selected: FocusEntity
}

interface Cohort {
  readonly cohortPatientIds: ReadonlyArray<PatientId>
}

export const SIMILARITY_PROVIDER = ['matrix', 'embeddings'] as const
export type SimilarityProvider = typeof SIMILARITY_PROVIDER[number]

interface IndexPatient {
  readonly indexPatientId: PatientId
  readonly similarityProvider: SimilarityProvider
}

interface SplitPane {
  isResizing: boolean
}

interface SimilarityPrompt {
  readonly similarityPrompt: string
}

type CohortExplanationData =
  | DataLoadingPending
  | DataLoadingInProgress
  | DataLoadingFailed
  | DataLoadingComplete<{ result: string }>

interface CohortExplanation {
  readonly cohortExplanationPrompt: string
  readonly cohortExplanationResult: CohortExplanationData
}

export type DataState =
  | DataStateLoadingPending
  | DataStateLoadingInProgress
  | DataStateLoadingFailed
  | DataStateLoadingComplete

const dataSlice = createSlice({
  name: 'data',
  initialState: { type: 'loading-pending' } as DataState,
  reducers: {
    loadingDataInProgress: (_state: DataState, action: PayloadAction<LoadingProgress>): DataState => ({
      type: 'loading-in-progress',
      ...action.payload,
    }),
    loadingDataFailed: (_state: DataState, action: PayloadAction<string>): DataState => ({
      type: 'loading-failed',
      errorMessage: action.payload,
    }),
    loadingDataComplete: (_state: DataState, action: PayloadAction<LoadedData>): DataState => ({
      type: 'loading-complete',
      filters: [],
      view: 'patients',
      hovered: FOCUS_ENTITY_NONE,
      selected: FOCUS_ENTITY_NONE,
      indexPatientId: PatientIdNone,
      similarityProvider: 'matrix',
      isResizing: false,
      similarityPrompt: '',
      cohortPatientIds: [],
      cohortExplanationPrompt: '',
      cohortExplanationResult: {
        type: 'loading-pending',
      },
      ...freeze(action.payload, true),
    }),
    setHoveredEntity: (state: Draft<DataState>, action: PayloadAction<FocusEntity>) => {
      mutateLoadedDataState(state, (s) => {
        s.hovered = action.payload.uid === EntityIdNone ? FOCUS_ENTITY_NONE : action.payload
      })
    },
    setSelectedEntity: (state: Draft<DataState>, action: PayloadAction<FocusEntity>) => {
      mutateLoadedDataState(state, (s) => {
        if (s.selected.uid === action.payload.uid && s.selected.type === action.payload.type) {
          s.selected = FOCUS_ENTITY_NONE
        } else {
          s.selected = action.payload.uid === EntityIdNone ? FOCUS_ENTITY_NONE : action.payload
        }
      })
    },
    addDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (data) => {
        const existingFilterIndex = data.findIndex((filter) => filter.column.name === action.payload.column.name)

        if (existingFilterIndex !== -1) {
          data[existingFilterIndex] = action.payload
        } else {
          data.push(action.payload)
        }
      })
    },
    removeDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (data) => {
        const existingFilterIndex = data.findIndex((filter) => filter.column.name === action.payload.column.name)

        if (existingFilterIndex !== -1) {
          data.splice(existingFilterIndex, 1)
        }
      })
    },
    resetDataFilter: (state: Draft<DataState>) => ({
      ...state,
      filters: [],
    }),
    setDataView: (state: Draft<DataState>, action: PayloadAction<ActiveDataViewType>) => {
      mutateLoadedDataState(state, (data) => {
        data.view = action.payload
      })
    },
    setIndexPatient: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateLoadedDataState(state, (s) => {
        s.indexPatientId = action.payload as PatientId
        s.similarityData.indexPatientSimilarities = {
          type: 'loading-pending',
        }
      })
    },
    resetIndexPatient: (state: Draft<DataState>) => {
      mutateLoadedDataState(state, (s) => {
        s.indexPatientId = PatientIdNone

        const similarityFilter = s.filters.findIndex((filter) => filter.column.name === 'Similarity')

        if (similarityFilter !== -1) {
          s.filters.splice(similarityFilter, 1)
        }

        s.similarityData.indexPatientSimilarities = {
          type: 'loading-pending',
        }
      })
    },
    setSplitPaneResizing: (state: Draft<DataState>, action: PayloadAction<SplitPane>) => {
      mutateLoadedDataState(state, (s) => {
        s.isResizing = action.payload.isResizing
      })
    },
    loadingSimilaritiesInProgress: (state: Draft<DataState>) => {
      mutateLoadedDataState(state, (s) => {
        s.similarityData.indexPatientSimilarities = {
          type: 'loading-in-progress',
        }
      })
    },
    loadingSimilaritiesDataFailed: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateLoadedDataState(state, (s) => {
        s.similarityData.indexPatientSimilarities = {
          type: 'loading-failed',
          errorMessage: action.payload,
        }
      })
    },
    loadingSimilaritiesComplete: (state: Draft<DataState>, action: PayloadAction<LoadedSimilarities>): DataState => {
      mutateLoadedDataState(state, (s) => {
        s.similarityData.indexPatientSimilarities = {
          type: 'loading-complete',
          ...freeze(action.payload, true),
        }
      })

      return state
    },
    setSimilarityProvider: (state: Draft<DataState>, action: PayloadAction<SimilarityProvider>) => {
      mutateLoadedDataState(state, (s) => {
        s.similarityProvider = action.payload
      })
    },
    setSimilarityPrompt: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateLoadedDataState(state, (s) => {
        s.similarityPrompt = action.payload
        // Set similarity provider to embeddings when prompt is set
        s.similarityProvider = action.payload ? 'embeddings' : s.similarityProvider
      })
    },
    setPromptEmbeddings: (state: Draft<DataState>, action: PayloadAction<EmbeddingsData['promptEmbeddings']>) => {
      mutateLoadedDataState(state, (s) => {
        s.embeddingsData.promptEmbeddings = action.payload
      })
    },
    addToCohort: (state: Draft<DataState>, action: PayloadAction<{ id: PatientId }>) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortPatientIds = [...new Set([...s.cohortPatientIds, action.payload.id])]
      })
    },
    removeFromCohort: (state: Draft<DataState>, action: PayloadAction<{ id: PatientId }>) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortPatientIds = s.cohortPatientIds.filter((id) => id !== action.payload.id)
      })
    },
    clearCohort: (state: Draft<DataState>) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortPatientIds = []
      })
    },
    setCohortExplanationPrompt: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortExplanationPrompt = action.payload
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPromptEmbeddings.pending, (state) => {
      mutateLoadedDataState(state, (s) => {
        s.embeddingsData.promptEmbeddings = {
          type: 'loading-in-progress',
        }
      })
    })
    builder.addCase(fetchPromptEmbeddings.fulfilled, (state, action) => {
      mutateLoadedDataState(state, (s) => {
        s.embeddingsData.promptEmbeddings = {
          type: 'loading-complete',
          embedding: action.payload,
        }
      })
    })
    builder.addCase(fetchPromptEmbeddings.rejected, (state, action) => {
      mutateLoadedDataState(state, (s) => {
        s.embeddingsData.promptEmbeddings = {
          type: 'loading-failed',
          errorMessage: action.error.message ?? 'Error while loading prompt embeddings',
        }
      })
    })
    builder.addCase(fetchCohortExplanation.pending, (state) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortExplanationResult = {
          type: 'loading-in-progress',
        }
      })
    })
    builder.addCase(fetchCohortExplanation.fulfilled, (state, action) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortExplanationResult = {
          type: 'loading-complete',
          result: action.payload ?? '',
        }
      })
    })
    builder.addCase(fetchCohortExplanation.rejected, (state, action) => {
      mutateLoadedDataState(state, (s) => {
        s.cohortExplanationResult = {
          type: 'loading-failed',
          errorMessage: action.error.message ?? 'Error while loading cohort explanation',
        }
      })
    })
  },
})

const mutateLoadedDataState = (
  state: Draft<DataState>,
  applyMutation: (data: Draft<DataStateLoadingComplete>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state)
  }
}

const mutateFilterData = (
  state: Draft<DataState>,
  applyMutation: (data: Draft<ReadonlyArray<GenericFilter>>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.filters)
  }
}

export const dataReducer = dataSlice.reducer
export const {
  loadingDataInProgress,
  loadingDataFailed,
  loadingDataComplete,
  setSelectedEntity,
  setHoveredEntity,
  addDataFilter,
  removeDataFilter,
  resetDataFilter,
  setDataView,
  setIndexPatient,
  resetIndexPatient,
  setSplitPaneResizing,
  loadingSimilaritiesInProgress,
  loadingSimilaritiesDataFailed,
  loadingSimilaritiesComplete,
  setSimilarityProvider,
  setSimilarityPrompt,
  setPromptEmbeddings,
  addToCohort,
  removeFromCohort,
  clearCohort,
  setCohortExplanationPrompt,
} = dataSlice.actions

/** Decouples redux action dispatch from loading implementation to avoid circular dependencies */
export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: Dispatch<AnyAction>) => {
    return await loadDataImpl(
      patientDataUrl,
      eventDataUrl,
      (progress: LoadingProgress) => dispatch(loadingDataInProgress(progress)),
      (data) => dispatch(loadingDataComplete(data)),
      (message) => dispatch(loadingDataFailed(message)),
      (alerts) => dispatch(addAlerts(alerts))
    )
  }

export const loadSimilarityData =
  (rowIndex: number, totalNumberOfRows: number, patientId: PatientId) => async (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingSimilaritiesInProgress())

    parseSpecificRowFromSimilarityFile(
      rowIndex,
      totalNumberOfRows,
      patientId,
      (data) => dispatch(loadingSimilaritiesComplete(data)),
      (warning) => dispatch(addAlerts([{ type: 'warning', topic: 'Index Patient', message: warning }])),
      (message) => {
        dispatch(loadingSimilaritiesDataFailed(message))
        dispatch(addAlerts([{ type: 'error', topic: 'Index Patient', message }]))
      }
    )
  }

export const fetchPromptEmbeddings = createAsyncThunk(
  'data/fetchPromptEmbeddings',
  async (promptAndJourneys: { prompt: string; randomPatientJourneys: string[] }, thunkAPI) => {
    console.log('Fetching prompt embeddings for prompt and journeys', promptAndJourneys)

    try {
      const promptEmbeddings = await retryOpenaiAPI(3, [
        promptAndJourneys.prompt,
        ...promptAndJourneys.randomPatientJourneys,
      ])

      if (promptEmbeddings && promptEmbeddings.data.data.length > 0) {
        // The first entry is the prompt embedding
        return promptEmbeddings.data.data[0].embedding
      } else {
        throw new Error('Could not fetch prompt embeddings')
      }
    } catch (error) {
      thunkAPI.dispatch(
        addAlerts([
          {
            type: 'error',
            topic: 'Prompt based Similarity',
            message: `Could not fetch prompt embeddings. ${error}`,
          },
        ])
      )
      throw error
    }
  }
)

export const fetchCohortExplanation = createAsyncThunk(
  'data/fetchCohortExplanation',
  async (cohortExplanationData: { prompt: string; cohort: ReadonlyArray<Patient> }, thunkAPI) => {
    // A prompt is set, fetch prompt embeddings and add random journeys for context
    const data = (thunkAPI.getState() as any).data as DataState

    if (data.type === 'loading-complete') {
      const patientJourneys = preparePatientJourneys(
        { ...data.patientData, allEntities: cohortExplanationData.cohort },
        data.eventData
      )

      // TODO: Tokens per Chunk should be small enough, so that there is space for the prompt
      // TODO: When creating the cohort, it should already validated towards the limit
      const { patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, 3500)

      console.log('Fetching ChatGPT response for cohort prompt: ', cohortExplanationData.prompt)

      const system_instruction = `You are an endocrinologist focused on helping patients with diabetes to help manage their disease. You will help the user based their CGM, Exercise, Meal, Sleep and Insulin data to understand why they experienced episodes hyperglycemia or hypoglycemia and you provide suggestions on how these could be avoided in the future. You are concise and only use expert language if necessary. `

      const context = `The following diabetes management data for the patient have been processed by the OpenAI Embeddings API.
      The retrieved embeddings were then reduced to 2 dimensions using the t-SNE algorithm and clustered using k-means clustering (k=3).
      I have then explored the resulting clusters and extracted the following specific days of data for further analysis:`

      try {
        const completion = await openaiAPI.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: system_instruction },
            { role: 'user', content: context },
            ...patientJourneyChunks[0].map((patientJourney, idx) => ({
              role: 'user' as ChatCompletionRequestMessageRoleEnum,
              content: `
              Day of diabetes data ${idx + 1}:
              ------
  
              ${patientJourney}
            `,
            })),
            {
              role: 'user',
              content: `${cohortExplanationData.prompt}}`,
            },
          ],
        })

        if (completion.data.choices.length > 0) {
          return completion.data.choices[0].message?.content.toString()
        } else {
          throw new Error('Could not fetch cohort explanation')
        }
      } catch (error) {
        thunkAPI.dispatch(
          addAlerts([
            {
              type: 'error',
              topic: 'Cohort Explanation',
              message: `Could not fetch cohort explanation. ${error}`,
            },
          ])
        )
        throw error
      }
    }
  }
)
