import React from 'react'

import { Filter, FilterColumn, GenericFilter, MillisNone, NumberNone, TrilianNone } from '../../filtering'

import { BooleanDataFilter } from './BooleanDataFilter'
import { DateDataFilter } from './DateDataFilter'
import { NumberDataFilter } from './NumberDataFilter'
import { TextDataFilter } from './TextDataFilter'
import { QualityDataFilter } from './QualityDataFilter'
import { DataColumn } from '../../columns'

export interface DataFilterProps<T extends FilterColumn['type']> {
  column: FilterColumn
  type: T
  filter?: Filter<T>
  onAddFilter: (filter: GenericFilter) => void
  onRemoveFilter: (filter: GenericFilter) => void
}

export const DataFilter = <T extends FilterColumn['type']>({
  column,
  type,
  filter,
  onAddFilter,
  onRemoveFilter,
}: DataFilterProps<T>) => {
  switch (type) {
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
          column={column}
          type={type}
          value={
            (filter as Filter<'number'> | undefined)?.value ?? {
              from: NumberNone,
              to: NumberNone,
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
          column={column}
          type={type}
          value={
            (filter as Filter<'date'> | Filter<'timestamp'> | undefined)?.value ?? {
              millisFrom: MillisNone,
              millisTo: MillisNone,
            }
          }
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    case 'quality':
      return (
        <QualityDataFilter
          column={column as DataColumn<'quality'>}
          type={type}
          value={(filter as Filter<'quality'> | undefined)?.value ?? { text: '' }}
          onChange={onAddFilter}
          onRemove={onRemoveFilter}
        />
      )
    default:
      throw new Error(`Unknown filter type: ${type}`)
  }
}
