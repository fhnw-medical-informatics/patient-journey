import { ScatterPlot as ScatterPlotComponent } from '../components/ScatterPlot'
import { useScatterPlotData } from '../hooks'
import { usePatientDataColumns } from '../../data/hooks'
import { useEffect } from 'react'
import { useAppDispatch } from '../../store'
import { setScatterPlotXAxisColumn, setScatterPlotYAxisColumn } from '../plotSlice'
import { DataColumn } from '../../data/columns'

export const ScatterPlot = () => {
  const data = useScatterPlotData()

  // TODO: Remove once selectable via drop-down
  const exampleColumn = usePatientDataColumns()[4] as DataColumn<'number'>

  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setScatterPlotXAxisColumn(exampleColumn))
    dispatch(setScatterPlotYAxisColumn(exampleColumn))
  }, [dispatch, exampleColumn])

  return <ScatterPlotComponent data={data} />
}
