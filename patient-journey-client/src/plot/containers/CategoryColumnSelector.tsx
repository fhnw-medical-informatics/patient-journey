import { ColumnSelector as ColumnSelectorComponent } from '../components/ColumnSelector'
import { useActiveScatterPlotCategoryColumn } from '../hooks'
import { useAllCategoricalPatientDataColumns } from '../../data/hooks'
import { useAppDispatch } from '../../store'
import { useCallback } from 'react'
import { PlotColumnNone, ScatterPlotCategoryColumn, setScatterPlotCategoryColumn } from '../plotSlice'

export const CategoryColumnSelector = () => {
  const activeCategoryColumn = useActiveScatterPlotCategoryColumn()
  const allSelectableColumns = useAllCategoricalPatientDataColumns()

  const dispatch = useAppDispatch()

  const onChange = useCallback(
    (column: ScatterPlotCategoryColumn) => {
      dispatch(setScatterPlotCategoryColumn(column))
    },
    [dispatch]
  )

  return (
    <ColumnSelectorComponent
      label={`Category (Optional)`}
      activeColumn={activeCategoryColumn}
      allSelectableColumns={[PlotColumnNone, ...allSelectableColumns]}
      onChange={onChange}
    />
  )
}
