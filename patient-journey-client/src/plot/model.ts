import { PatientId } from '../data/patients'

export interface ScatterPlotDatum {
  patientId: PatientId
  x: number
  y: number
}
