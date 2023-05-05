import { useSelector } from 'react-redux'
import {
  selectActiveScatterPlotXAxisColumn,
  selectActiveScatterPlotYAxisColumn,
  selectScatterPlotData,
  selectScatterPlotInfo,
} from './selectors'

export const useScatterPlotData = () => useSelector(selectScatterPlotData)
export const useActiveScatterPlotXAxisColumn = () => useSelector(selectActiveScatterPlotXAxisColumn)
export const useActiveScatterPlotYAxisColumn = () => useSelector(selectActiveScatterPlotYAxisColumn)
export const useScatterPlotInfo = () => useSelector(selectScatterPlotInfo)
