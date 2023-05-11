import { useAppSelector } from '../store'
import { selectPatientCohort } from './selectors'

export const usePatientCohort = () => useAppSelector(selectPatientCohort)
