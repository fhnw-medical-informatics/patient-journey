import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { PatientId } from '../data/patients'

interface CohortState {
  patientIds: ReadonlyArray<PatientId>
}

const initialState: CohortState = { patientIds: [] }

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState,
  reducers: {
    addToCohort: (state: Draft<CohortState>, action: PayloadAction<{ id: PatientId }>) => {
      state.patientIds = [...new Set([...state.patientIds, action.payload.id])]
    },
    removeFromCohort: (state: Draft<CohortState>, action: PayloadAction<{ id: PatientId }>) => {
      state.patientIds = state.patientIds.filter((id) => id !== action.payload.id)
    },
    clearCohort: (state: Draft<CohortState>) => {
      state.patientIds = []
    },
  },
})

export const { addToCohort, removeFromCohort, clearCohort } = cohortSlice.actions
export const cohortReducer = cohortSlice.reducer
