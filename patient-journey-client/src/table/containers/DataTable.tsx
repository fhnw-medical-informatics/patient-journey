import React, { useCallback } from 'react'
import { useColor } from '../../color/useColor'
import { DataTable as DataTableComponent } from '../components/DataTable'
import { useActiveDataColumns, useEntityInteraction, useFilteredActiveData } from '../../data/hooks'
import { useActiveTableState } from '../hooks'
import { useAppDispatch, useAppSelector } from '../../store'
import { setSorting } from '../tableSlice'
import { selectDataView } from '../../data/selectors'
import { ColumnSortingState } from '../../data/sorting'

export const DataTable = () => {
  const view = useAppSelector(selectDataView)
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()
  const activeTableState = useActiveTableState()
  const { colorByColumnFn, colorByColumn } = useColor()

  const { onEntityClick, onEntityHover, selectedEntity, hoveredEntity } = useEntityInteraction()

  const dispatch = useAppDispatch()

  const onSortingChange = useCallback(
    (sorting: ColumnSortingState) => dispatch(setSorting({ view, sorting })),
    [dispatch, view]
  )

  return (
    <DataTableComponent
      rows={activeData}
      columns={activeColumns}
      selectedEntity={selectedEntity}
      hoveredEntity={hoveredEntity}
      sorting={activeTableState.sorting}
      onEntityClick={onEntityClick}
      onEntityHover={onEntityHover}
      onSortingChange={onSortingChange}
      colorByColumn={colorByColumn}
      colorByColumnFn={colorByColumnFn}
    />
  )
}
