import { ScatterPlot as ScatterPlotComponent } from '../components/ScatterPlot'
import { useScatterPlotData } from '../hooks'

export const ScatterPlot = () => {
  const data = useScatterPlotData()
  return <ScatterPlotComponent {...data} />
}
