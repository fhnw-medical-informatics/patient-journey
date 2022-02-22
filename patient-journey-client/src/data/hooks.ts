import { useAppDispatch, useAppSelector } from '../store'
import { selectHoveredPatient, selectPatientData, selectSelectedPatient } from './selectors'
import { setHoveredPatient, setSelectedPatient } from './dataSlice'
import { useCallback } from 'react'
import { PatientId, PatientIdNone } from './patients'

export const usePatientData = () => useAppSelector(selectPatientData)
export const useSelectedPatient = (): PatientId => useAppSelector(selectSelectedPatient)
export const useHoveredPatient = () => useAppSelector(selectHoveredPatient)

export interface PatientInteraction {
  readonly selectedPatient: PatientId
  readonly hoveredPatient: PatientId
  readonly onPatientClick: (id: PatientId) => void
  readonly onPatientHover: (id: PatientId) => void
}

export const usePatientInteraction = (): PatientInteraction => {
  const selectedPatient = useSelectedPatient()
  const hoveredPatient = useHoveredPatient()

  const dispatch = useAppDispatch()

  const onPatientClick = useCallback(
    (id: PatientId) => {
      dispatch(setSelectedPatient(selectedPatient === id ? PatientIdNone : id))
    },
    [selectedPatient, dispatch]
  )

  const onPatientHover = useCallback(
    (id: PatientId) => {
      dispatch(setHoveredPatient(id))
    },
    [dispatch]
  )

  return {
    selectedPatient,
    hoveredPatient,
    onPatientClick,
    onPatientHover,
  }
}
