import React from 'react'

import { useAppDispatch } from '../../../store'
import { useFilters, usePatientDataColumns } from '../../hooks'

import { DataFilters as DataFiltersComponent } from '../../components/filter/DataFilters'
import { GenericFilter } from '../../filtering'
import { addDataFilter, removeDataFilter, resetDataFilter } from '../../dataSlice'

export const DataFilters = () => {
  const filters = useFilters()
  const patientDataColumns = usePatientDataColumns()
  // TODO: Integrate event data columns
  // const eventDataColumns = useEventDataColumns()
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
      activeFilters={filters}
      availableColumns={patientDataColumns}
      onAddFilter={handleAddFilter}
      onRemoveFilter={handleRemoveFilter}
      onResetFilters={handleResetFilters}
    />
  )
}
