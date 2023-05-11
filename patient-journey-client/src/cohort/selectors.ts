import { RootState } from '../store'
import { PatientId } from '../data/patients'

export const selectPatientCohort = (s: RootState): ReadonlySet<PatientId> => new Set(s.cohort.patientIds)
