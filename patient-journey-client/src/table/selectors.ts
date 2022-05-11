import { createSelector } from '@reduxjs/toolkit'
import { selectDataView } from '../data/selectors'
import { RootState } from '../store'

const selectTableState = (state: RootState) => state.table

const selectActiveTableState = createSelector(
  selectTableState,
  selectDataView,
  (tableByView, view) => tableByView[view]
)

export const selectActiveSorting = createSelector(
  selectActiveTableState,
  (activeTableState) => activeTableState.sorting
)
