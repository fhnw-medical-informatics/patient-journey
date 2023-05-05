import { EntityId } from '../data/entities'

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
  readonly entityId: EntityId
  readonly x: number
  readonly y: number
}
