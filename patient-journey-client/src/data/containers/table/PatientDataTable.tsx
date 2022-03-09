import React from 'react'

import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { useFilteredPatientData, usePatientInteraction } from '../../hooks'

export const PatientDataTable = () => {
  const patientData = useFilteredPatientData()
  const { onPatientClick, onPatientHover } = usePatientInteraction()

  return (
    <PatientDataTableComponent data={patientData} onPatientClick={onPatientClick} onPatientHover={onPatientHover} />
  )
}
