import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { PatientData } from '../../patients'
import React from 'react'
import { usePatientInteraction } from '../../hooks'

interface Props {
  readonly data: PatientData
}

export const PatientDataTable = ({ data }: Props) => {
  const { onPatientClick, onPatientHover } = usePatientInteraction()
  return <PatientDataTableComponent data={data} onPatientClick={onPatientClick} onPatientHover={onPatientHover} />
}
