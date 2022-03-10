import React from 'react'

import { DataTable as DataTableComponent } from '../../components/table/DataTable'
import { useFilteredActiveData, usePatientInteraction } from '../../hooks'

export const DataTable = () => {
  const activeData = useFilteredActiveData()

  const { onPatientClick, onPatientHover } = usePatientInteraction()

  return <DataTableComponent data={activeData} onPatientClick={onPatientClick} onPatientHover={onPatientHover} />
}
