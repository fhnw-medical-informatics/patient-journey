import React from 'react'

import { DataTable as DataTableComponent } from '../../components/table/DataTable'
import { useActiveDataView, useFilteredEventData, useFilteredPatientData, usePatientInteraction } from '../../hooks'

export const DataTable = () => {
  const patientData = useFilteredPatientData()
  const eventData = useFilteredEventData()

  const activeDataView = useActiveDataView()

  const { onPatientClick, onPatientHover } = usePatientInteraction()

  return (
    <DataTableComponent
      data={activeDataView === 'patients' ? patientData : eventData}
      onPatientClick={onPatientClick}
      onPatientHover={onPatientHover}
    />
  )
}
