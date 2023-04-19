import { RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { ScatterPlotDatum } from './model'
import { selectCrossFilteredPatientData } from '../data/selectors'
import { PlotColumnNone } from './plotSlice'
import { DataColumn, extractNumberValueSafe } from '../data/columns'

export const selectScatterPlotState = (s: RootState) => s.plot.scatterPlot

export const selectScatterPlotData = createSelector(
  selectCrossFilteredPatientData,
  selectScatterPlotState,
  (patientData, plotState): ScatterPlotDatum[] => {
    if (plotState.xAxisColumn === PlotColumnNone || plotState.yAxisColumn === PlotColumnNone) {
      return []
    } else {
      const xCol: DataColumn<'number'> = plotState.xAxisColumn
      const yCol: DataColumn<'number'> = plotState.yAxisColumn
      return patientData.map<ScatterPlotDatum>((patient) => {
        const xSafe = extractNumberValueSafe(xCol)(patient)
        const ySafe = extractNumberValueSafe(yCol)(patient)
        return {
          patientId: patient.pid,
          x: xSafe.length === 0 ? NaN : xSafe[0],
          y: ySafe.length === 0 ? NaN : ySafe[0],
        }
      })
    }
  }
)
