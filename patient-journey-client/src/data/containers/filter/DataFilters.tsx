import React from 'react'

import { useAppDispatch } from '../../../store'
import {
  useAllFilters,
  useActiveDataColumns,
  useActiveData,
  useFilteredActiveData,
  useActiveDataView,
} from '../../hooks'

import { DataFilters as DataFiltersComponent } from '../../components/filter/DataFilters'
import { GenericFilter } from '../../filtering'
import { addDataFilter, removeDataFilter, resetDataFilter } from '../../dataSlice'

export const DataFilters = () => {
  const activeView = useActiveDataView()
  const allActiveData = useActiveData()
  const filteredActiveData = useFilteredActiveData()

  const filters = useAllFilters()
  const activeColums = useActiveDataColumns()

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
    />
  )
}
