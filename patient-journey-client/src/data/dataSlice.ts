import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as dataForge from 'data-forge'

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
  patients: PatientModel
}>

type PatientModel = ReadonlyArray<Patient>
interface Patient {}

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
    loadingDataComplete: (_state: DataState, action: PayloadAction<PatientModel>): DataState => ({
      type: 'loading-complete',
      patients: action.payload,
    }),
  },
})

export const dataReducer = dataSlice.reducer
const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

export const DATA_FILE_URL = 'data/mock-patients.csv'

export const loadData = () => async (dispatch: AppDispatch) => {
  dispatch(loadingDataInProgress())
  try {
    const response = await fetch(DATA_FILE_URL)
    const csv = await response.text()
    const data = await dataForge.fromCSV(csv)
    dispatch(loadingDataComplete(data.toRows()))
  } catch (e) {
    console.error(e)
    dispatch(loadingDataFailed('Error fetching data'))
  }
}
