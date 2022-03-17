import React from 'react'

import { DataTable as DataTableComponent } from '../../components/table/DataTable'
import { useActiveDataColumns, useFilteredActiveData, usePatientInteraction } from '../../hooks'

export const DataTable = () => {
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()

  const { onPatientClick, onPatientHover } = usePatientInteraction()

  return (
    <DataTableComponent
      data={activeData}
      columns={activeColumns}
      onPatientClick={onPatientClick}
      onPatientHover={onPatientHover}
    />
  )
}
