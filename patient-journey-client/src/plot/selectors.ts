import { RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { ScatterPlotData, ScatterPlotDatum } from './model'
import { selectCrossFilteredPatientData } from '../data/selectors'
import { PlotColumnNone } from './plotSlice'
import { DataColumn, extractNumberValueSafe } from '../data/columns'

export const selectScatterPlotState = (s: RootState) => s.plot.scatterPlot

export const selectScatterPlotData = createSelector(
  selectCrossFilteredPatientData,
  selectScatterPlotState,
  (patientData, plotState): ScatterPlotData => {
    if (plotState.xAxisColumn === PlotColumnNone || plotState.yAxisColumn === PlotColumnNone) {
      return { xAxisLabel: '', yAxisLabel: '', data: [] }
    } else {
      const xCol: DataColumn<'number'> = plotState.xAxisColumn
      const yCol: DataColumn<'number'> = plotState.yAxisColumn
      const data = patientData.map<ScatterPlotDatum>((patient) => {
        const xSafe = extractNumberValueSafe(xCol)(patient)
        const ySafe = extractNumberValueSafe(yCol)(patient)
        return {
          entityId: patient.uid,
          x: xSafe.length === 0 ? NaN : xSafe[0],
          y: ySafe.length === 0 ? NaN : ySafe[0],
        }
      })
      return { xAxisLabel: xCol.name, yAxisLabel: yCol.name, data: [{ id: '', data }] }
    }
  }
)

export const selectActiveScatterPlotXAxisColumn = createSelector(selectScatterPlotState, (s) => s.xAxisColumn)
export const selectActiveScatterPlotYAxisColumn = createSelector(selectScatterPlotState, (s) => s.yAxisColumn)
