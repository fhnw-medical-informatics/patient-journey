import { AnyAction, createAsyncThunk, createSlice, Draft, freeze, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { GenericFilter } from './filtering'
import { EntityId, EntityIdNone, EntityType } from './entities'
import { loadData as loadDataImpl, LoadedData, LoadingProgress } from './loading'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './constants'
import { addAlerts } from '../alert/alertSlice'
import { PatientId, PatientIdNone } from './patients'
import { LoadedSimilarities, parseSpecificRowFromSimilarityFile } from './similarities'
import { EmbeddingsData, retryOpenaiAPI } from './embeddings'

type DataStateLoadingPending = Readonly<{
  type: 'loading-pending'
}>

type DataStateLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}> &
  LoadingProgress

export type DataStateLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export type DataStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedData &
  ActiveDataView &
  Filters &
  Hovering &
  Selection &
  IndexPatient &
  SplitPane &
  SimilarityPrompt

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
  }
)
