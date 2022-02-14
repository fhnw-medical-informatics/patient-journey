import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { PatientData, PatientId, PatientIdNone, setSelectedPatient } from '../../dataSlice'
import React, { useCallback } from 'react'
import { useAppDispatch } from '../../../store'

interface Props {
  readonly data: PatientData
}

export const PatientDataTable = ({ data }: Props) => {
  const dispatch = useAppDispatch()

  const onPatientClick = useCallback(
    (id: PatientId) => {
      dispatch(setSelectedPatient({ id: data.selectedPatient === id ? PatientIdNone : id }))
    },
    [data.selectedPatient, dispatch]
  )

  return (
    <PatientDataTableComponent
      columns={data.fields}
      patients={data.allPatients}
      selectedPatient={data.selectedPatient}
      onPatientClick={onPatientClick}
    />
  )
}
