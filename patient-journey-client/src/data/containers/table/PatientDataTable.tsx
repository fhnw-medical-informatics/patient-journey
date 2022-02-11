import { PatientDataTable as PatientDataTableComponent } from '../../components/table/PatientDataTable'
import { PatientData, PatientId, togglePatientSelection } from '../../dataSlice'
import { useCallback } from 'react'
import { useAppDispatch } from '../../../store'

interface Props {
  readonly data: PatientData
}

export const PatientDataTable = ({ data }: Props) => {
  const dispatch = useAppDispatch()
  const onTogglePatientSelection = useCallback(
    (id: PatientId) => {
      dispatch(togglePatientSelection({ id }))
    },
    [dispatch]
  )
  return (
    <PatientDataTableComponent
      columns={data.fields}
      patients={data.allPatients}
      selectedPatients={new Set(data.selectedPatients)}
      onTogglePatientSelection={onTogglePatientSelection}
    />
  )
}
