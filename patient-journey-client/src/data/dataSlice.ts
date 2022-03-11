import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './dataConfig'
import { createPatientData, PatientData, PatientId } from './patients'
import { createEventData, EventData } from './events'
import { GenericFilter } from './filtering'

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
    setSelectedPatient: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutatePatientData(state, (pd) => (pd.selectedPatient = action.payload as PatientId))
    },
    setHoveredPatient: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutatePatientData(state, (pd) => (pd.hoveredPatient = action.payload as PatientId))
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

const mutatePatientData = (state: Draft<DataState>, applyMutation: (pd: Draft<PatientData>) => void) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.patientData)
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
export const { setSelectedPatient, setHoveredPatient, addDataFilter, removeDataFilter, resetDataFilter, setDataView } =
  dataSlice.actions

const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: AppDispatch) => {
    dispatch(loadingDataInProgress())
    try {
      const patientData = createPatientData(await parseFromUrl(patientDataUrl))
      const eventData = createEventData(await parseFromUrl(eventDataUrl))
      dispatch(loadingDataComplete({ patientData, eventData }))
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
