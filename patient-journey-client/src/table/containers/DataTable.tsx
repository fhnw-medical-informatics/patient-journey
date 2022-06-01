import React, { useCallback, useEffect } from 'react'
import { useColor } from '../../color/hooks'
import { DataTable as DataTableComponent } from '../components/DataTable'
import {
  useActiveDataColumns,
  useActiveEntityInteraction,
  useFilteredActiveData,
  useActiveSelectedEntity,
  useIndexPatientId,
  useIndexPatientIdIndex,
} from '../../data/hooks'
import { useActiveTableSorting } from '../hooks'
import { useAppDispatch, useAppSelector } from '../../store'
import { setSorting } from '../tableSlice'
import { selectDataView } from '../../data/selectors'
import { ColumnSortingState } from '../../data/sorting'
import { ColorByColumnNone } from '../../color/colorSlice'
import { loadSimilarityData, resetIndexPatient } from '../../data/dataSlice'

export const DataTable = React.memo(() => {
  const view = useAppSelector(selectDataView)
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()
  const sorting = useActiveTableSorting()
  const { colorByColumnFn, colorByColumn } = useColor()

  const { onEntityClick, onEntityHover } = useActiveEntityInteraction()
  const selectedEntityId = useActiveSelectedEntity()
  const indexPatientId = useIndexPatientId()

  const indexPatientIndex = useIndexPatientIdIndex()

  const dispatch = useAppDispatch()

  const onSortingChange = useCallback(
    (sorting: ColumnSortingState) => dispatch(setSorting({ view, sorting })),
    [dispatch, view]
  )

  const onResetIndexPatient = useCallback(() => {
    dispatch(resetIndexPatient())
  }, [dispatch])

  // TODO: This should be handled by the data slice (middleware)
  useEffect(() => {
    if (indexPatientIndex !== undefined) {
      dispatch(loadSimilarityData(indexPatientIndex))
    }
  }, [indexPatientIndex, dispatch])

  return (
    <DataTableComponent
      rows={activeData}
      columns={activeColumns}
      sorting={sorting}
      selectedEntity={selectedEntityId}
      onEntityClick={onEntityClick}
      onEntityHover={onEntityHover}
      onSortingChange={onSortingChange}
      colorByColumn={view === colorByColumn.type ? colorByColumn : ColorByColumnNone}
      colorByColumnFn={colorByColumnFn}
      indexPatientId={indexPatientId}
      onResetIndexPatient={onResetIndexPatient}
      enableIndexPatientColumn={view === 'patients'}
    />
  )
})
