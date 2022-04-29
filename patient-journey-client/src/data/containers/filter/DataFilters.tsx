import React, { useCallback } from 'react'

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
import { useColor } from '../../../color/hooks'

export const DataFilters = React.memo(() => {
  const activeView = useActiveDataView()
  const allActiveData = useActiveData()
  const filteredActiveData = useFilteredActiveData()

  const filters = useAllFilters()
  const activeColums = useActiveDataColumns()

  const { colorByCategoryFn, colorByNumberFn, colorByColumn } = useColor()

  const dispatch = useAppDispatch()

  const handleAddFilter = useCallback(
    (filter: GenericFilter) => {
      dispatch(addDataFilter(filter))
    },
    [dispatch]
  )

  const handleRemoveFilter = useCallback(
    (filter: GenericFilter) => {
      dispatch(removeDataFilter(filter))
    },
    [dispatch]
  )

  const handleResetFilters = useCallback(() => {
    dispatch(resetDataFilter())
  }, [dispatch])

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
      colorByCategoryFn={colorByCategoryFn}
    />
  )
})
