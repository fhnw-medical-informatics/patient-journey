import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'
import { ParseResult } from 'papaparse'

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
  patientData: PatientData
}>

interface PatientData {
  readonly fields: ReadonlyArray<string>
  readonly rows: ReadonlyArray<Patient>
}

enum PatientIdBrand {}

export type PatientId = PatientIdBrand & string
export const PatientIdNone = 'n/a' as PatientId

export interface Patient {
  readonly id: PatientId
  readonly values: ReadonlyArray<string>
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
    loadingDataComplete: (_state: DataState, action: PayloadAction<PatientData>): DataState => ({
      type: 'loading-complete',
      patientData: action.payload,
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
      // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
      const result = csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true })
      const data = createData(result)
      dispatch(loadingDataComplete(data))
    } catch (e) {
      console.error(e)
      dispatch(loadingDataFailed('Error fetching data'))
    }
  }

const createData = (result: ParseResult<string[]>): PatientData => {
  if (result.data.length === 0) {
    return {
      fields: [],
      rows: [],
    }
  } else {
    return {
      fields: result.data[0],
      rows: result.data.slice(1).map((row: string[]) => {
        return {
          id: row[0] as PatientId,
          values: row,
        }
      }),
    }
  }
}
