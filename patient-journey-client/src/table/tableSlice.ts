import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColumnSortingState } from '../data/sorting'
import { ACTIONS_AFFECTING_ROW_COUNT, ACTIVE_DATA_VIEWS, ActiveDataViewType } from '../data/dataSlice'

type TableStateByView = {
  readonly [key in ActiveDataViewType]: TableState
}

export interface TableState {
  readonly sorting: ColumnSortingState
  readonly page: number
}

const INITIAL_TABLE_STATE: TableState = {
  sorting: {
    type: 'neutral',
  },
  page: 0,
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
    setPage: (state, action: PayloadAction<{ view: ActiveDataViewType; page: number }>) => {
      const { view, page } = action.payload
      state[view].page = page
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(ACTIONS_AFFECTING_ROW_COUNT, (state) => {
      ACTIVE_DATA_VIEWS.forEach((view) => {
        state[view].page = 0
      })
    }),
})

export const tableReducer = tableSlice.reducer
export const { setSorting, setPage } = tableSlice.actions
