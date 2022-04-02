import React, { useCallback } from 'react'
import { useColor } from '../../color/useColor'
import { DataTable as DataTableComponent } from '../components/DataTable'
import { useActiveDataColumns, useEntityInteraction, useFilteredActiveData } from '../../data/hooks'
import { useActiveTableState } from '../hooks'
import { useAppDispatch, useAppSelector } from '../../store'
import { setPage, setSorting } from '../tableSlice'
import { selectDataView } from '../../data/selectors'
import { ColumnSortingState } from '../../data/sorting'

export const DataTable = () => {
  const view = useAppSelector(selectDataView)
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()
  const activeTableState = useActiveTableState()
  const [colorByColumnFn, , , colorByColumn] = useColor()

  const { onEntityClick, onEntityHover, selectedEntity, hoveredEntity } = useEntityInteraction()

  const dispatch = useAppDispatch()

  const onSortingChange = useCallback(
    (sorting: ColumnSortingState) => dispatch(setSorting({ view, sorting })),
    [dispatch, view]
  )

  const onPageChange = useCallback((page: number) => dispatch(setPage({ view, page })), [dispatch, view])

  return (
    <DataTableComponent
      data={activeData}
      columns={activeColumns}
      selectedEntity={selectedEntity}
      hoveredEntity={hoveredEntity}
      sorting={activeTableState.sorting}
      page={activeTableState.page}
      onEntityClick={onEntityClick}
      onEntityHover={onEntityHover}
      onSortingChange={onSortingChange}
      onPageChange={onPageChange}
      colorByColumn={colorByColumn}
      colorByColumnFn={colorByColumnFn}
    />
  )
}
