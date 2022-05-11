import { createSelector } from '@reduxjs/toolkit'
import { selectActiveDataColumns, selectDataView } from '../data/selectors'
import { ColumnSortingState } from '../data/sorting'
import { RootState } from '../store'

const selectTableState = (state: RootState) => state.table

const selectActiveTableState = createSelector(
  selectTableState,
  selectDataView,
  (tableByView, view) => tableByView[view]
)

export const selectActiveSorting = createSelector(
  selectActiveTableState,
  selectActiveDataColumns,
  (activeTableState, activeColumns) => {
    if (activeTableState.sorting.type === 'neutral') {
      return activeTableState.sorting
    } else {
      const sortingCol = activeTableState.sorting.column

      if (
        activeColumns.findIndex(
          (col) => col.name === sortingCol.name && col.type === sortingCol.type && col.index === sortingCol.index
        ) !== -1
      ) {
        return activeTableState.sorting
      } else {
        return {
          type: 'neutral',
        } as ColumnSortingState
      }
    }
  }
)
