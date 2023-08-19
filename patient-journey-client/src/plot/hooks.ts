import {
  selectActiveScatterPlotEntityType,
  selectActiveScatterPlotXAxisColumn,
  selectActiveScatterPlotYAxisColumn,
  selectScatterPlotData,
  selectScatterPlotEventDataColumns,
  selectScatterPlotInfo,
  selectScatterPlotPatientDataColumns,
} from './selectors'
import { useAppSelector } from '../store'

export const useScatterPlotData = () => useAppSelector(selectScatterPlotData)

export const useActiveScatterPlotEntityType = () => useAppSelector(selectActiveScatterPlotEntityType)

export const useScatterPlotPatientDataColumns = () => useAppSelector(selectScatterPlotPatientDataColumns)
export const useScatterPlotEventDataColumns = () => useAppSelector(selectScatterPlotEventDataColumns)

export const useActiveScatterPlotXAxisColumn = () => useAppSelector(selectActiveScatterPlotXAxisColumn)
export const useActiveScatterPlotYAxisColumn = () => useAppSelector(selectActiveScatterPlotYAxisColumn)

export const useScatterPlotInfo = () => useAppSelector(selectScatterPlotInfo)
