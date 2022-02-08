import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'

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

export const loadData = () => async (dispatch: AppDispatch) => {
  dispatch(loadingDataInProgress())
  try {
    // TODO: Load data from CSV
    await new Promise((r) => setTimeout(r, 2000))
    dispatch(loadingDataComplete([{}, {}, {}]))
  } catch (e) {
    console.error(e)
    dispatch(loadingDataFailed('Error fetching data'))
  }
}
