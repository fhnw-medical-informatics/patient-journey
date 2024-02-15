import React, { useCallback } from 'react'

import { Filter } from '../../filtering'
import { DataColumn } from '../../columns'
import { useCategories } from '../diagram/hooks'
import { Entity } from '../../entities'
import { GenericDataFilter } from './GenericCategoryFilter'

export interface CategoryDataFilterProps extends Filter<'category'> {
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'category'>) => void
  onRemove: (filter: Filter<'category'>) => void
}

export const CategoryDataFilter = ({
  allActiveData,
  column,
  type,
  value,
  onChange,
  onRemove,
}: CategoryDataFilterProps) => {
  const { uniqueCategories } = useCategories(allActiveData, column as DataColumn<'category'>)

  const createValue = useCallback((values: string[]) => ({ categories: values }), [])
  const extractValue = useCallback(
    (filterValue: Filter<'category'>['value']) => (filterValue.categories.length !== 0 ? filterValue.categories : []),
    []
  )

  return (
    <GenericDataFilter
      uniqueData={uniqueCategories}
      column={column}
      type={type}
      value={value}
      createValue={createValue}
      extractValue={extractValue}
      onChange={onChange}
      onRemove={onRemove}
    />
  )
}
