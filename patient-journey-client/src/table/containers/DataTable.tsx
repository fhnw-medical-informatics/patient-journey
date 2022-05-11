import React, { useCallback } from 'react'
import { useColor } from '../../color/hooks'
import { DataTable as DataTableComponent } from '../components/DataTable'
import {
  useActiveDataColumns,
  useActiveEntityInteraction,
  useFilteredActiveData,
  useActiveSelectedEntity,
  useIndexPatientId,
} from '../../data/hooks'
import { useActiveTableSorting } from '../hooks'
import { useAppDispatch, useAppSelector } from '../../store'
import { setSorting } from '../tableSlice'
import { selectDataView } from '../../data/selectors'
import { ColumnSortingState } from '../../data/sorting'
import { ColorByColumnNone } from '../../color/colorSlice'
import { PatientId } from '../../data/patients'
import { resetIndexPatient, setIndexPatient } from '../../data/dataSlice'

export const DataTable = React.memo(() => {
  const view = useAppSelector(selectDataView)
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()
  const sorting = useActiveTableSorting()
  const { colorByColumnFn, colorByColumn } = useColor()

  const { onEntityClick, onEntityHover } = useActiveEntityInteraction()
  const selectedEntityId = useActiveSelectedEntity()
  const indexPatientId = useIndexPatientId()

  const dispatch = useAppDispatch()

  const onSortingChange = useCallback(
    (sorting: ColumnSortingState) => dispatch(setSorting({ view, sorting })),
    [dispatch, view]
  )

  const onSetIndexPatient = useCallback(
    (pid: PatientId) => {
      dispatch(setIndexPatient(pid))
    },
    [dispatch]
  )

  const onResetIndexPatient = useCallback(() => {
    dispatch(resetIndexPatient())
  }, [dispatch])

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
      onSetIndexPatient={onSetIndexPatient}
      onResetIndexPatient={onResetIndexPatient}
      enableIndexPatientColumn={view === 'patients'}
    />
  )
})
