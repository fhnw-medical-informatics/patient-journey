import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { PatientData, PatientId, PatientIdNone, setHoveredPatient, setSelectedPatient } from '../../dataSlice'
import React, { useCallback } from 'react'
import { useAppDispatch } from '../../../store'

interface Props {
  readonly data: PatientData
}

export const PatientDataTable = ({ data }: Props) => {
  const dispatch = useAppDispatch()

  const onPatientClick = useCallback(
    (id: PatientId) => {
      dispatch(setSelectedPatient(data.selectedPatient === id ? PatientIdNone : id))
    },
    [data.selectedPatient, dispatch]
  )

  const onPatientHover = useCallback(
    (id: PatientId) => {
      dispatch(setHoveredPatient(id))
    },
    [dispatch]
  )

  return (
    <PatientDataTableComponent
      columns={data.fields}
      patients={data.allPatients}
      selectedPatient={data.selectedPatient}
      onPatientClick={onPatientClick}
      onPatientHover={onPatientHover}
    />
  )
}
