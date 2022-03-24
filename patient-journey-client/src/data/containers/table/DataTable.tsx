import React from 'react'

import { DataTable as DataTableComponent } from '../../components/table/DataTable'
import {
  useActiveDataColumns,
  useFilteredActiveData,
  useHoveredPatient,
  usePatientInteraction,
  useSelectedPatient,
} from '../../hooks'

export const DataTable = () => {
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()
  const selectedEntity = useSelectedPatient() // TODO: useActiveSelectedEntity
  const hoveredEntity = useHoveredPatient() // TODO: useActiveHoveredEntity

  const { onPatientClick, onPatientHover } = usePatientInteraction()

  return (
    <DataTableComponent
      data={activeData}
      columns={activeColumns}
      selectedEntity={selectedEntity}
      hoveredEntity={hoveredEntity}
      onPatientClick={onPatientClick}
      onPatientHover={onPatientHover}
    />
  )
}
