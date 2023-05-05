import { RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { ScatterPlotData, ScatterPlotDatum, ScatterPlotInfo } from './model'
import { selectCrossFilteredPatientData, selectFocusEntity, selectPatientDataRowMap } from '../data/selectors'
import { PlotColumnNone } from './plotSlice'
import { DataColumn, extractNumberValueSafe, formatColumnValue } from '../data/columns'

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

export const selectScatterPlotInfo = createSelector(
  selectScatterPlotState,
  selectPatientDataRowMap,
  selectFocusEntity,
  (state, dataByIdMap, focusEntity): ScatterPlotInfo => {
    if (state.xAxisColumn === PlotColumnNone || state.yAxisColumn === PlotColumnNone) {
      return 'none'
    } else {
      const data = dataByIdMap.get(focusEntity.uid)
      if (data) {
        const x = data.values[state.xAxisColumn.index]
        const y = data.values[state.yAxisColumn.index]
        return {
          xAxisLabel: state.xAxisColumn.name,
          yAxisLabel: state.yAxisColumn.name,
          xValueFormatted: formatColumnValue(state.xAxisColumn.type)(x),
          yValueFormatted: formatColumnValue(state.yAxisColumn.type)(y),
        }
      } else {
        return 'none'
      }
    }
  }
)
