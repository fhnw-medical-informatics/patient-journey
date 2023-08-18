import { useCallback } from 'react'

import { ColumnSelector as ColumnSelectorComponent } from '../components/ColumnSelector'
import {
  useActiveScatterPlotEntityType,
  useActiveScatterPlotXAxisColumn,
  useActiveScatterPlotYAxisColumn,
  useScatterPlotPatientDataColumns,
  useScatterPlotEventDataColumns,
} from '../hooks'

import { useAppDispatch } from '../../store'

import {
  PlotColumnNone,
  ScatterPlotAxisColumn,
  setScatterPlotXAxisColumn,
  setScatterPlotYAxisColumn,
} from '../plotSlice'

interface Props {
  readonly axis: 'x' | 'y'
}

export const AxisColumnSelector = ({ axis }: Props) => {
  const activeEntityType = useActiveScatterPlotEntityType()
  const activeXAxisColumn = useActiveScatterPlotXAxisColumn()
  const activeYAxisColumn = useActiveScatterPlotYAxisColumn()
  const allSelectablePatientColumns = useScatterPlotPatientDataColumns()
  const allSelectableEventColumns = useScatterPlotEventDataColumns()

  const dispatch = useAppDispatch()

  const onChange = useCallback(
    (column: ScatterPlotAxisColumn) => {
      dispatch(axis === 'x' ? setScatterPlotXAxisColumn(column) : setScatterPlotYAxisColumn(column))
    },
    [axis, dispatch]
  )

  return (
    <ColumnSelectorComponent
      label={`${axis.toUpperCase()} Axis`}
      activeColumn={axis === 'x' ? activeXAxisColumn : activeYAxisColumn}
      allSelectableColumns={[
        PlotColumnNone,
        ...(activeEntityType === 'patients' ? allSelectablePatientColumns : allSelectableEventColumns),
      ]}
      onChange={onChange}
    />
  )
}
