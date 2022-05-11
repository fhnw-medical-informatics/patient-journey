import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColumnSortingState } from '../data/sorting'
import { ActiveDataViewType, resetIndexPatient } from '../data/dataSlice'

type TableStateByView = {
  readonly [key in ActiveDataViewType]: TableState
}

export interface TableState {
  readonly sorting: ColumnSortingState
}

const INITIAL_TABLE_STATE: TableState = {
  sorting: {
    type: 'neutral',
  },
}

const initialState: TableStateByView = {
  patients: INITIAL_TABLE_STATE,
  events: INITIAL_TABLE_STATE,
}

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSorting: (state, action: PayloadAction<{ view: ActiveDataViewType; sorting: ColumnSortingState }>) => {
      const { view, sorting } = action.payload
      state[view].sorting = sorting
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetIndexPatient, (state) => {
      if (state.patients.sorting.type !== 'neutral') {
        const sortingColumn = state.patients.sorting.column

        if (sortingColumn.name === 'Similarity') {
          state.patients.sorting = { type: 'neutral' }
        }
      }
    })
  },
})

export const tableReducer = tableSlice.reducer
export const { setSorting } = tableSlice.actions
