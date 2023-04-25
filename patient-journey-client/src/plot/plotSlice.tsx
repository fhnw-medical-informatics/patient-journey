import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { DataColumn } from '../data/columns'

export type ScatterPlotColumn = DataColumn<'number'> | NoPlotColumn

export const PlotColumnNone = 'n/a'
export type NoPlotColumn = typeof PlotColumnNone

export interface ScatterPlotState {
  readonly xAxisColumn: ScatterPlotColumn
  readonly yAxisColumn: ScatterPlotColumn
}

export interface PlotState {
  scatterPlot: ScatterPlotState
}

const initialState: PlotState = { scatterPlot: { xAxisColumn: PlotColumnNone, yAxisColumn: PlotColumnNone } }

export const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    setScatterPlotXAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotColumn>) => {
      state.scatterPlot.xAxisColumn = action.payload
    },
    setScatterPlotYAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotColumn>) => {
      state.scatterPlot.yAxisColumn = action.payload
    },
  },
})

export const plotReducer = plotSlice.reducer

export const { setScatterPlotXAxisColumn, setScatterPlotYAxisColumn } = plotSlice.actions
