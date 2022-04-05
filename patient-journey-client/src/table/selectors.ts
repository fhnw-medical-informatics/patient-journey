import { createSelector } from '@reduxjs/toolkit'
import { selectDataView } from '../data/selectors'
import { RootState } from '../store'

export const selectActiveTableState = createSelector(
  (state: RootState) => state.table,
  selectDataView,
  (tableByView, view) => tableByView[view]
)
