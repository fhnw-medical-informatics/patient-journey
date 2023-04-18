import { parseDataFromUrl } from '../data/loading'
import { SIMILARITY_DATA_FILE_URL } from '../data/constants'
import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { SVD } from 'svd-js'
import { PatientId } from '../data/patients'

export interface MdsPoint {
  id: PatientId
  x: number
  y: number
}

interface MdsState {
  points: ReadonlyArray<MdsPoint>
}

const initialState: MdsState = { points: [] }

const mdsSlice = createSlice({
  name: 'mds',
  initialState,
  reducers: {
    setPoints: (state, action: PayloadAction<any>) => {
      state.points = action.payload
    },
  },
})

const { setPoints } = mdsSlice.actions
export const mdsReducer = mdsSlice.reducer

export const create2dProjection = () => async (dispatch: Dispatch<AnyAction>) => {
  const result = await parseDataFromUrl(SIMILARITY_DATA_FILE_URL)

  // convert to numbers, skipping row/column headers
  const similarityMatrix = result.data.slice(1).map((rowArray) => rowArray.slice(1).map((s) => parseFloat(s)))

  const distanceMatrix: number[][] = similarityMatrix.map((row) => row.map((sim) => Math.sqrt(1 - sim)))

  const { u, q } = SVD(distanceMatrix)

  const coordinates: number[][] = u.map((row) => [row[0] * q[0], row[1] * q[1]])

  const points = coordinates.map<MdsPoint>(([x, y], i) => ({ id: result.data[0][i + 1] as PatientId, x, y }))

  dispatch(setPoints(points))
}
