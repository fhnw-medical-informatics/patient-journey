import { PatientId } from '../data/patients'

export interface ScatterPlotData {
  readonly xAxisLabel: string
  readonly yAxisLabel: string
  readonly data: ScatterPlotDataSeries[] // nivo prefers mutability
}

export interface ScatterPlotDataSeries {
  readonly id: string
  readonly data: ScatterPlotDatum[] // nivo prefers mutability
}

export interface ScatterPlotDatum {
  readonly patientId: PatientId
  readonly x: number
  readonly y: number
  readonly category: string
}
