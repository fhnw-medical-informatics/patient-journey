import { RootState } from '../store'
import { createSelector } from '@reduxjs/toolkit'
import { ScatterPlotData, ScatterPlotDataSeries, ScatterPlotDatum } from './model'
import { selectCrossFilteredPatientData } from '../data/selectors'
import { PlotColumnNone, ScatterPlotCategoryColumn } from './plotSlice'
import { DataColumn, extractCategoryValueSafe, extractNumberValueSafe } from '../data/columns'
import { Patient } from '../data/patients'
import { group } from 'd3-array'

export const selectScatterPlotState = (s: RootState) => s.plot.scatterPlot

export const SCATTER_PLOT_DEFAULT_CATEGORY = ''

const extractCategoryValue = (column: ScatterPlotCategoryColumn, patient: Patient) => {
  if (column === PlotColumnNone) {
    return SCATTER_PLOT_DEFAULT_CATEGORY
  } else {
    const category = extractCategoryValueSafe(column)(patient)
    if (category.length === 0) {
      return SCATTER_PLOT_DEFAULT_CATEGORY
    } else {
      return category[0]
    }
  }
}

export const selectScatterPlotData = createSelector(
  selectCrossFilteredPatientData,
  selectScatterPlotState,
  (patientData, plotState): ScatterPlotData => {
    if (plotState.xAxisColumn === PlotColumnNone || plotState.yAxisColumn === PlotColumnNone) {
      return { xAxisLabel: '', yAxisLabel: '', data: [] }
    } else {
      const xCol: DataColumn<'number'> = plotState.xAxisColumn
      const yCol: DataColumn<'number'> = plotState.yAxisColumn
      const categoryCol = plotState.categoryColumn

      const dataPoints = patientData.map<ScatterPlotDatum>((patient) => {
        const xSafe = extractNumberValueSafe(xCol)(patient)
        const ySafe = extractNumberValueSafe(yCol)(patient)
        const category = extractCategoryValue(categoryCol, patient)
        return {
          patientId: patient.pid,
          x: xSafe.length === 0 ? NaN : xSafe[0],
          y: ySafe.length === 0 ? NaN : ySafe[0],
          category,
        }
      })

      const data = [
        ...group<ScatterPlotDatum, string>(dataPoints, (p) => p.category).entries(),
      ].map<ScatterPlotDataSeries>(([category, data]) => ({ id: category, data }))

      return { xAxisLabel: xCol.name, yAxisLabel: yCol.name, data }
    }
  }
)

export const selectActiveScatterPlotXAxisColumn = createSelector(selectScatterPlotState, (s) => s.xAxisColumn)
export const selectActiveScatterPlotYAxisColumn = createSelector(selectScatterPlotState, (s) => s.yAxisColumn)
export const selectActiveScatterPlotCategoryColumn = createSelector(selectScatterPlotState, (s) => s.categoryColumn)
