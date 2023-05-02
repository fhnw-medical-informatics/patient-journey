import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { DataColumn } from '../data/columns'

export type ScatterPlotAxisColumn = DataColumn<'number'> | NoPlotColumn
export type ScatterPlotCategoryColumn = DataColumn<'category'> | NoPlotColumn

export const PlotColumnNone = 'n/a'
export type NoPlotColumn = typeof PlotColumnNone

export interface ScatterPlotState {
  readonly xAxisColumn: ScatterPlotAxisColumn
  readonly yAxisColumn: ScatterPlotAxisColumn
  readonly categoryColumn: ScatterPlotCategoryColumn
}

export interface PlotState {
  scatterPlot: ScatterPlotState
}

const initialState: PlotState = {
  scatterPlot: { xAxisColumn: PlotColumnNone, yAxisColumn: PlotColumnNone, categoryColumn: PlotColumnNone },
}

export const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    setScatterPlotXAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotAxisColumn>) => {
      state.scatterPlot.xAxisColumn = action.payload
    },
    setScatterPlotYAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotAxisColumn>) => {
      state.scatterPlot.yAxisColumn = action.payload
    },
    setScatterPlotCategoryColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotCategoryColumn>) => {
      state.scatterPlot.categoryColumn = action.payload
    },
  },
})

export const plotReducer = plotSlice.reducer

export const { setScatterPlotXAxisColumn, setScatterPlotYAxisColumn, setScatterPlotCategoryColumn } = plotSlice.actions
