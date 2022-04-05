import { AnyAction, createSlice, Draft, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { GenericFilter } from './filtering'
import { DataEntity, Entity, EntityId, EntityIdNone } from './entities'
import { EVENT_DATA_FILE_URL, loadData as loadDataImpl, LoadedData, PATIENT_DATA_FILE_URL } from './loading'
import { addAlerts } from '../alert/alertSlice'
import { Dispatch } from 'redux'
import { DataColumn } from './columns'

type DataStateLoadingPending = Readonly<{
  type: 'loading-pending'
}>

type DataStateLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}>

export type DataStateLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export type DataStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedData &
  ActiveDataView &
  Filters

export const ACTIVE_DATA_VIEWS = ['patients', 'events'] as const
export type ActiveDataViewType = typeof ACTIVE_DATA_VIEWS[number]

interface ActiveDataView {
  readonly view: ActiveDataViewType
}

interface Filters {
  readonly filters: ReadonlyArray<GenericFilter>
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
    loadingDataInProgress: (): DataState => ({
      type: 'loading-in-progress',
    }),
    loadingDataFailed: (_state: DataState, action: PayloadAction<string>): DataState => ({
      type: 'loading-failed',
      errorMessage: action.payload,
    }),
    loadingDataComplete: (_state: DataState, action: PayloadAction<LoadedData>): DataState => ({
      type: 'loading-complete',
      filters: [],
      view: 'patients',
      ...action.payload,
    }),
    setSelectedEntity: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateActiveEntityData(
        state,
        (data) =>
          (data.selectedEntity = data.selectedEntity === action.payload ? EntityIdNone : (action.payload as EntityId))
      )
    },
    setHoveredEntity: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateActiveEntityData(state, (data) => (data.hoveredEntity = action.payload as EntityId))
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
      mutateDataViewData(state, (data) => {
        data.view = action.payload
      })
    },
  },
})

const mutateActiveEntityData = (
  state: Draft<DataState>,
  applyMutation: (data: Draft<DataEntity<Entity, DataColumn<string>>>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.view === 'patients' ? state.patientData : state.eventData)
  }
}

const mutateDataViewData = (state: Draft<DataState>, applyMutation: (data: Draft<ActiveDataView>) => void) => {
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
export const { setSelectedEntity, setHoveredEntity, addDataFilter, removeDataFilter, resetDataFilter, setDataView } =
  dataSlice.actions

export const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

export const ACTIONS_AFFECTING_ROW_COUNT = isAnyOf(addDataFilter, removeDataFilter, resetDataFilter)

/** Decouples redux action dispatch from loading implementation to avoid circular dependencies */
export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: Dispatch<AnyAction>) => {
    return await loadDataImpl(
      patientDataUrl,
      eventDataUrl,
      () => dispatch(loadingDataInProgress()),
      (data) => dispatch(loadingDataComplete(data)),
      (message) => dispatch(loadingDataFailed(message)),
      (alerts) => dispatch(addAlerts(alerts))
    )
  }
