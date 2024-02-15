import React from 'react'

import { Filter, FilterColumn, GenericFilter, MillisNone, NumberNone, TrilianNone } from '../../filtering'

import { BooleanDataFilter } from './BooleanDataFilter'
import { DateDataFilter } from './DateDataFilter'
import { NumberDataFilter } from './NumberDataFilter'
import { TextDataFilter } from './TextDataFilter'
import { CategoryDataFilter } from './CategoryDataFilter'
import { DataColumn } from '../../columns'
import { Entity } from '../../entities'
import { PIDDataFilter } from '../../containers/filter/PIDDataFilter'

export interface DataFilterProps<T extends FilterColumn['type']> {
  allActiveData: ReadonlyArray<Entity>
  column: FilterColumn
  type: T
  filter?: Filter<T>
  onAddFilter: (filter: GenericFilter) => void
  onRemoveFilter: (filter: GenericFilter) => void
}

export const DataFilter = <T extends FilterColumn['type']>({
  allActiveData,
  column,
  type,
  filter,
  onAddFilter,
  onRemoveFilter,
}: DataFilterProps<T>) => {
  switch (type) {
    case 'pid':
      return (
        <PIDDataFilter
          allActiveData={allActiveData}
          column={column}
          type={type}
          value={(filter as Filter<'pid'> | undefined)?.value ?? { uids: [] }}
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'string':
      return (
        <TextDataFilter
          column={column}
          type={type}
          value={(filter as Filter<'string'> | undefined)?.value ?? { text: '' }}
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'number':
      return (
        <NumberDataFilter
          allActiveData={allActiveData}
          column={column}
          type={type}
          value={
            (filter as Filter<'number'> | undefined)?.value ?? {
              from: NumberNone,
              to: NumberNone,
              toInclusive: true,
            }
          }
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'boolean':
      return (
        <BooleanDataFilter
          column={column}
          type={type}
          value={
            (filter as Filter<'boolean'> | undefined)?.value ?? {
              isTrue: TrilianNone,
            }
          }
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'date':
    case 'timestamp':
      return (
        <DateDataFilter
          allActiveData={allActiveData}
          column={column}
          type={type}
          value={
            (filter as Filter<'date'> | Filter<'timestamp'> | undefined)?.value ?? {
              millisFrom: MillisNone,
              millisTo: MillisNone,
              toInclusive: true,
            }
          }
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'category':
      return (
        <CategoryDataFilter
          allActiveData={allActiveData}
          column={column as DataColumn<'category'>}
          type={type}
          value={(filter as Filter<'category'> | undefined)?.value ?? { categories: [] }}
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    default:
      throw new Error(`Unknown filter type: ${type}`)
  }
}
