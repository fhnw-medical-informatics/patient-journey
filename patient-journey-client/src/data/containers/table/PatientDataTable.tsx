import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { PatientData } from '../../dataSlice'
import React from 'react'
import { usePatientInteraction } from '../../hooks'

interface Props {
  readonly data: PatientData
}

export const PatientDataTable = ({ data }: Props) => {
  const { selectedPatient, onPatientClick, onPatientHover } = usePatientInteraction()
  return (
    <PatientDataTableComponent
      columns={data.fields}
      patients={data.allPatients}
      selectedPatient={selectedPatient}
      onPatientClick={onPatientClick}
      onPatientHover={onPatientHover}
    />
  )
}
