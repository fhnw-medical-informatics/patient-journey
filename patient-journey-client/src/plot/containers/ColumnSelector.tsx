import { ColumnSelector as ColumnSelectorComponent } from '../components/ColumnSelector'
import { useActiveScatterPlotXAxisColumn, useActiveScatterPlotYAxisColumn } from '../hooks'
import { useAllNumericPatientDataColumns } from '../../data/hooks'
import { useAppDispatch } from '../../store'
import { useCallback } from 'react'
import { PlotColumnNone, ScatterPlotColumn, setScatterPlotXAxisColumn, setScatterPlotYAxisColumn } from '../plotSlice'

interface Props {
  readonly axis: 'x' | 'y'
}

export const ColumnSelector = ({ axis }: Props) => {
  const activeXAxisColumn = useActiveScatterPlotXAxisColumn()
  const activeYAxisColumn = useActiveScatterPlotYAxisColumn()
  const allSelectableColumns = useAllNumericPatientDataColumns()

  const dispatch = useAppDispatch()

  const onChange = useCallback(
    (column: ScatterPlotColumn) => {
      dispatch(axis === 'x' ? setScatterPlotXAxisColumn(column) : setScatterPlotYAxisColumn(column))
    },
    [axis, dispatch]
  )

  return (
    <ColumnSelectorComponent
      label={`${axis.toUpperCase()} Axis`}
      activeColumn={axis === 'x' ? activeXAxisColumn : activeYAxisColumn}
      allSelectableColumns={[PlotColumnNone, ...allSelectableColumns]}
      onChange={onChange}
    />
  )
}
