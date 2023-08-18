import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { EntityType } from '../data/entities'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

export type ScatterPlotAxisColumn = PatientDataColumn | EventDataColumn | NoPlotColumn

export const PlotColumnNone = 'n/a'
export type NoPlotColumn = typeof PlotColumnNone

export interface ScatterPlotState {
  readonly entityType: EntityType
  readonly xAxisColumn: ScatterPlotAxisColumn
  readonly yAxisColumn: ScatterPlotAxisColumn
}

export interface PlotState {
  scatterPlot: ScatterPlotState
}

const initialState: PlotState = {
  scatterPlot: { entityType: 'patients', xAxisColumn: PlotColumnNone, yAxisColumn: PlotColumnNone },
}

export const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    setScatterPlotEntityType: (state: Draft<PlotState>, action: PayloadAction<EntityType>) => {
      if (state.scatterPlot.entityType !== action.payload) {
        state.scatterPlot = {
          ...state.scatterPlot,
          entityType: action.payload,
          xAxisColumn: PlotColumnNone,
          yAxisColumn: PlotColumnNone,
        }
      }
    },
    setScatterPlotXAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotAxisColumn>) => {
      state.scatterPlot.xAxisColumn = action.payload
    },
    setScatterPlotYAxisColumn: (state: Draft<PlotState>, action: PayloadAction<ScatterPlotAxisColumn>) => {
      state.scatterPlot.yAxisColumn = action.payload
    },
  },
})

export const plotReducer = plotSlice.reducer

export const { setScatterPlotEntityType, setScatterPlotXAxisColumn, setScatterPlotYAxisColumn } = plotSlice.actions
