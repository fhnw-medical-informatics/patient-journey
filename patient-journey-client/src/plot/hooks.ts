import { useSelector } from 'react-redux'
import { selectScatterPlotData } from './selectors'

export const useScatterPlotData = () => useSelector(selectScatterPlotData)
