import React from 'react'

import { makeStyles } from '../../../utils'

import { Filter, FilterColumn, GenericFilter, MillisNone, NumberNone } from '../../filtering'
import { DateDataFilter } from './DateDataFilter'
import { NumberDataFilter } from './NumberDataFilter'
import { TextDataFilter } from './TextDataFilter'

const useStyles = makeStyles()((theme) => ({
  filter: {
    padding: theme.spacing(1),
  },
}))

interface DataFiltersProps {
  activeFilters: ReadonlyArray<GenericFilter>
  availableColumns: ReadonlyArray<FilterColumn>
  onAddFilter: (filter: GenericFilter) => void
  onRemoveFilter: (columnName: GenericFilter) => void
  onResetFilters: () => void
}

export const DataFilters = ({ activeFilters, availableColumns, onAddFilter }: DataFiltersProps) => {
  const { classes } = useStyles()

  const findActiveFilter = <T extends FilterColumn['type']>(
    column: FilterColumn,
    filters: ReadonlyArray<GenericFilter>,
    type: T
  ): Filter<T> | undefined => {
    return filters.filter((filter) => filter.type === type).find((filter) => filter.column.name === column.name) as
      | Filter<T>
      | undefined
  }

  return (
    <div>
      <h3>Filters</h3>
      {availableColumns.map((availableColumn) => {
        switch (availableColumn.type) {
          case 'string':
            return (
              <div key={availableColumn.name} className={classes.filter}>
                <TextDataFilter
                  column={availableColumn}
                  type={availableColumn.type}
                  value={findActiveFilter(availableColumn, activeFilters, availableColumn.type)?.value ?? { text: '' }}
                  onChange={onAddFilter}
                />
              </div>
            )
          case 'number':
            return (
              <div key={availableColumn.name} className={classes.filter}>
                <NumberDataFilter
                  column={availableColumn}
                  type={availableColumn.type}
                  value={
                    findActiveFilter(availableColumn, activeFilters, availableColumn.type)?.value ?? {
                      from: NumberNone,
                      to: NumberNone,
                    }
                  }
                  onChange={onAddFilter}
                />
              </div>
            )
          case 'date':
          case 'timestamp':
            return (
              <div key={availableColumn.name} className={classes.filter}>
                <DateDataFilter
                  column={availableColumn}
                  type={availableColumn.type}
                  value={
                    findActiveFilter(availableColumn, activeFilters, availableColumn.type)?.value ?? {
                      millisFrom: MillisNone,
                      millisTo: MillisNone,
                    }
                  }
                  onChange={onAddFilter}
                />
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
