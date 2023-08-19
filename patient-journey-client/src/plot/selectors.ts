import { RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { ScatterPlotData, ScatterPlotDatum, ScatterPlotInfo } from './model'
import {
  selectCrossFilteredEventData,
  selectCrossFilteredPatientData,
  selectEventDataColumns,
  selectFocusEntity,
  selectPatientDataColumns,
  selectPatientDataRowMap,
} from '../data/selectors'
import { PlotColumnNone } from './plotSlice'
import { extractColumnValueSafe, formatColumnValue } from '../data/columns'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

export const selectScatterPlotPatientDataColumns = createSelector(selectPatientDataColumns, (columns) => columns)

export const selectScatterPlotEventDataColumns = createSelector(selectEventDataColumns, (columns) => columns)

export const selectScatterPlotState = (s: RootState) => s.plot.scatterPlot

export const selectActiveScatterPlotEntityType = createSelector(selectScatterPlotState, (s) => s.entityType)

export const selectScatterPlotData = createSelector(
  selectCrossFilteredEventData,
  selectCrossFilteredPatientData,
  selectActiveScatterPlotEntityType,
  selectScatterPlotState,
  (eventData, patientData, activeEntityType, plotState): ScatterPlotData => {
    if (plotState.xAxisColumn === PlotColumnNone || plotState.yAxisColumn === PlotColumnNone) {
      return { xAxisLabel: '', yAxisLabel: '', data: [] }
    } else {
      const xCol: PatientDataColumn | EventDataColumn = plotState.xAxisColumn
      const yCol: PatientDataColumn | EventDataColumn = plotState.yAxisColumn
      const data = (activeEntityType === 'patients' ? patientData : eventData).flatMap<ScatterPlotDatum>((entity) => {
        const xSafe = extractColumnValueSafe(xCol)(entity)
        const ySafe = extractColumnValueSafe(yCol)(entity)

        if (xSafe.length === 0 || ySafe.length === 0) {
          return []
        } else {
          return {
            entityId: entity.uid,
            x: xSafe[0],
            y: ySafe[0],
          }
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
