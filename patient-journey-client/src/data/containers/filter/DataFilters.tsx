import React from 'react'
import { useAppDispatch } from '../../../store'
import {
  useActiveData,
  useActiveDataColumns,
  useActiveDataView,
  useAllFilters,
  useFilteredActiveData,
} from '../../hooks'
import { DataFilters as DataFiltersComponent } from '../../components/filter/DataFilters'
import { GenericFilter } from '../../filtering'
import { addDataFilter, removeDataFilter, resetDataFilter } from '../../dataSlice'
import { useColor } from '../../../color/useColor'

export const DataFilters = () => {
  const activeView = useActiveDataView()
  const allActiveData = useActiveData()
  const filteredActiveData = useFilteredActiveData()

  const filters = useAllFilters()
  const activeColums = useActiveDataColumns()

  const [, , colorByNumberFn, colorByQualityFn, colorByColumn] = useColor()

  const dispatch = useAppDispatch()

  const handleAddFilter = (filter: GenericFilter) => {
    dispatch(addDataFilter(filter))
  }

  const handleRemoveFilter = (filter: GenericFilter) => {
    dispatch(removeDataFilter(filter))
  }

  const handleResetFilters = () => {
    dispatch(resetDataFilter())
  }

  return (
    <DataFiltersComponent
      activeView={activeView}
      allActiveData={allActiveData}
      filteredActiveData={filteredActiveData}
      activeFilters={filters}
      availableColumns={activeColums}
      onAddFilter={handleAddFilter}
      onRemoveFilter={handleRemoveFilter}
      onResetFilters={handleResetFilters}
      colorByColumn={colorByColumn}
      colorByNumberFn={colorByNumberFn}
      colorByQualityFn={colorByQualityFn}
    />
  )
}
