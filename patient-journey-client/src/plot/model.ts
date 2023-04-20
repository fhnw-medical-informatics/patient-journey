import { PatientId } from '../data/patients'

export interface ScatterPlotData {
  readonly xAxisLabel: string
  readonly yAxisLabel: string
  readonly data: ScatterPlotDatum[]
}

export interface ScatterPlotDatum {
  readonly patientId: PatientId
  readonly x: number
  readonly y: number
}
