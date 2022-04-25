import { createSelector } from '@reduxjs/toolkit'
import { selectDataView } from '../data/selectors'
import { RootState } from '../store'

const selectTableState = (state: RootState) => state.table

export const selectActiveTableState = createSelector(
  selectTableState,
  selectDataView,
  (tableByView, view) => tableByView[view]
)
