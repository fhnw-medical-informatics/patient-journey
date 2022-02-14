import { useAppSelector } from '../store'
import { selectHoveredPatient, selectPatientData, selectSelectedPatient } from './selectors'
import { PatientId } from './dataSlice'

export const usePatientData = () => useAppSelector(selectPatientData)
export const useSelectedPatient = (): PatientId => useAppSelector(selectSelectedPatient)
export const useHoveredPatient = () => useAppSelector(selectHoveredPatient)
