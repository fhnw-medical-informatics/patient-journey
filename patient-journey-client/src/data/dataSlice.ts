import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './dataConfig'
import { createPatientData, PatientData } from './patients'
import { createEventData, EventData } from './events'
import { GenericFilter } from './filtering'
import { Entity, EntityId, EntityIdNone } from './entities'
import { addAlerts, Alert } from '../alert/alertSlice'

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

interface LoadedData {
  readonly patientData: PatientData
  readonly eventData: EventData
}

export type ActiveDataViewType = PatientData['type'] | EventData['type']

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
        (pd) => (pd.selectedEntity = pd.selectedEntity === action.payload ? EntityIdNone : (action.payload as EntityId))
      )
    },
    setHoveredEntity: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateActiveEntityData(state, (pd) => (pd.hoveredEntity = action.payload as EntityId))
    },
    // TODO: Tests
    addDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (fd) => {
        const existingFilterIndex = fd.findIndex((filter) => filter.column.name === action.payload.column.name)

        if (existingFilterIndex !== -1) {
          fd[existingFilterIndex] = action.payload
        } else {
          fd.push(action.payload)
        }
      })
    },
    // TODO: Tests
    removeDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (fd) => {
        fd = fd.filter((filter) => filter.column.name !== action.payload.column.name)
      })
    },
    // TODO: Tests
    resetDataFilter: (state: Draft<DataState>) => ({
      ...state,
      filters: [],
    }),
    // TODO: Tests
    setDataView: (state: Draft<DataState>, action: PayloadAction<ActiveDataViewType>) => {
      mutateDataViewData(state, (vd) => {
        vd.view = action.payload
      })
    },
  },
})

const mutateActiveEntityData = (
  state: Draft<DataState>,
  applyMutation: (pd: Draft<PatientData | EventData>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.view === 'patients' ? state.patientData : state.eventData)
  }
}

const mutateDataViewData = (state: Draft<DataState>, applyMutation: (pd: Draft<ActiveDataView>) => void) => {
  if (state.type === 'loading-complete') {
    applyMutation(state)
  }
}

const mutateFilterData = (
  state: Draft<DataState>,
  applyMutation: (fd: Draft<ReadonlyArray<GenericFilter>>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.filters)
  }
}

export const dataReducer = dataSlice.reducer
export const { setSelectedEntity, setHoveredEntity, addDataFilter, removeDataFilter, resetDataFilter, setDataView } =
  dataSlice.actions

const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: AppDispatch) => {
    dispatch(loadingDataInProgress())
    try {
      const patientData = createPatientData(await parseFromUrl(patientDataUrl))
      const eventData = createEventData(await parseFromUrl(eventDataUrl))
      const data = { patientData, eventData }
      dispatch(loadingDataComplete(data))
      const alerts = findDataInconsistencies(data)
      dispatch(addAlerts(alerts))
    } catch (e) {
      console.error(e)
      dispatch(loadingDataFailed('Error fetching data'))
    }
  }

export async function parseFromUrl(url: string) {
  const response = await fetch(url)
  const csv = await response.text()
  return parseFromString(csv)
}

export const parseFromString = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true })
}

const findDataInconsistencies = ({ patientData, eventData }: LoadedData): ReadonlyArray<Alert> => {
  let alerts = []
  const topic = 'Data Import Error'
  const duplicatePatientIds = findDuplicateUids(patientData.allEntities)
  if (duplicatePatientIds.length > 0) {
    alerts.push({ topic, message: `Non-unique patient identifiers: ${duplicatePatientIds}` })
  }
  const duplicateEventIds = findDuplicateUids(eventData.allEntities)
  if (duplicateEventIds.length > 0) {
    alerts.push({ topic, message: `Non-unique event identifiers: ${duplicateEventIds}` })
  }
  return alerts
}

const findDuplicateUids = (array: ReadonlyArray<Entity>): ReadonlyArray<EntityId> => [
  ...new Set(array.map((e) => e.uid).filter((e, i, a) => a.indexOf(e) !== i)),
]
