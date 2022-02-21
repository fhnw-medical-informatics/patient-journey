import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'
import { ParseResult } from 'papaparse'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './dataConfig'
import { PatientDataColumnType } from './columnTypes'

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
  LoadedData

interface LoadedData {
  readonly patientData: PatientData
  readonly eventData: EventData
}

export type DataState =
  | DataStateLoadingPending
  | DataStateLoadingInProgress
  | DataStateLoadingFailed
  | DataStateLoadingComplete

export interface PatientData {
  readonly columns: ReadonlyArray<PatientDataColumn>
  readonly allPatients: ReadonlyArray<Patient>
  readonly selectedPatient: PatientId
  readonly hoveredPatient: PatientId
}

enum PatientIdBrand {}

export type PatientId = PatientIdBrand & string
export const PatientIdNone = 'n/a' as PatientId

export const EMPTY_PATIENT_DATA: PatientData = {
  columns: [],
  allPatients: [],
  selectedPatient: PatientIdNone,
  hoveredPatient: PatientIdNone,
}

export interface Patient {
  readonly id: PatientId
  readonly values: ReadonlyArray<string>
}

export interface PatientDataColumn {
  readonly name: string
  readonly type: PatientDataColumnType
  readonly index: number
}

interface EventData {}

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
      ...action.payload,
    }),
    setSelectedPatient: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutatePatientData(state, (pd) => (pd.selectedPatient = action.payload as PatientId))
    },
    setHoveredPatient: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutatePatientData(state, (pd) => (pd.hoveredPatient = action.payload as PatientId))
    },
  },
})

const mutatePatientData = (state: Draft<DataState>, applyMutation: (pd: Draft<PatientData>) => void) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.patientData)
  }
}

export const dataReducer = dataSlice.reducer
export const { setSelectedPatient, setHoveredPatient } = dataSlice.actions

const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: AppDispatch) => {
    dispatch(loadingDataInProgress())
    try {
      const patientData = await loadPatientData(patientDataUrl)
      const eventData = await loadEventData(eventDataUrl)
      dispatch(loadingDataComplete({ patientData, eventData }))
    } catch (e) {
      console.error(e)
      dispatch(loadingDataFailed('Error fetching data'))
    }
  }

export const parseData = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true })
}

async function loadPatientData(url: string) {
  const response = await fetch(url)
  const csv = await response.text()
  return createPatientData(parseData(csv))
}

export const createPatientData = (result: ParseResult<string[]>): PatientData => {
  const HEADER_ROW_COUNT = 2
  if (result.data.length < HEADER_ROW_COUNT) {
    return EMPTY_PATIENT_DATA
  } else {
    const columnNames = result.data[0]
    const columnTypes = result.data[1].map((v) => v.toLowerCase())
    const idColumnIndex = columnTypes.indexOf('pid')
    const columns = columnNames.map<PatientDataColumn>((name, index) => ({
      name,
      type: columnTypes[index] as PatientDataColumnType,
      index,
    }))
    return {
      ...EMPTY_PATIENT_DATA,
      columns,
      allPatients: result.data.slice(HEADER_ROW_COUNT).map((row: string[]) => {
        return {
          id: row[idColumnIndex] as PatientId,
          values: row,
        }
      }),
    }
  }
}

async function loadEventData(url: string) {
  const response = await fetch(url)
  const csv = await response.text()
  return createEventData(parseData(csv))
}

const createEventData = (result: ParseResult<string[]>): EventData => {
  return {}
}
