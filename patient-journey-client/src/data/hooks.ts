import { useAppDispatch, useAppSelector } from '../store'
import {
  selectDataView,
  selectHoveredPatient,
  selectSelectedPatient,
  selectFilteredActiveData,
  selectActiveDataColumns,
  selectActiveData,
  selectAllFilters,
} from './selectors'
import { setHoveredPatient, setSelectedPatient } from './dataSlice'
import { useCallback } from 'react'
import { PatientId, PatientIdNone } from './patients'

export const useActiveDataView = () => useAppSelector(selectDataView)

export const useActiveData = () => useAppSelector(selectActiveData)
export const useFilteredActiveData = () => useAppSelector(selectFilteredActiveData)

export const useActiveDataColumns = () => useAppSelector(selectActiveDataColumns)
export const useAllFilters = () => useAppSelector(selectAllFilters)

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
