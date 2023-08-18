import { useSelector } from 'react-redux'
import {
  selectActiveScatterPlotEntityType,
  selectActiveScatterPlotXAxisColumn,
  selectActiveScatterPlotYAxisColumn,
  selectScatterPlotData,
  selectScatterPlotInfo,
} from './selectors'

export const useScatterPlotData = () => useSelector(selectScatterPlotData)
export const useActiveScatterPlotEntityType = () => useSelector(selectActiveScatterPlotEntityType)
export const useActiveScatterPlotXAxisColumn = () => useSelector(selectActiveScatterPlotXAxisColumn)
export const useActiveScatterPlotYAxisColumn = () => useSelector(selectActiveScatterPlotYAxisColumn)
export const useScatterPlotInfo = () => useSelector(selectScatterPlotInfo)
