import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'

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

interface PatientModel {
  readonly columns: ReadonlyArray<string>
  readonly rows: ReadonlyArray<Patient>
}
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

export const loadData =
  (url: string = DATA_FILE_URL) =>
  async (dispatch: AppDispatch) => {
    dispatch(loadingDataInProgress())
    try {
      const response = await fetch(url)
      const csv = await response.text()
      const result = csvParser.parse<Patient>(csv, { header: true, skipEmptyLines: true })
      const data: PatientModel = {
        columns: result.meta.fields ?? [],
        rows: result.data,
      }
      dispatch(loadingDataComplete(data))
    } catch (e) {
      console.error(e)
      dispatch(loadingDataFailed('Error fetching data'))
    }
  }
