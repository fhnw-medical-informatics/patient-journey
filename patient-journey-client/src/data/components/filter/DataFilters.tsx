import React from 'react'

import FilterAltIcon from '@mui/icons-material/FilterAlt'

import { makeStyles } from '../../../utils'

import { TrilianNone, Filter, FilterColumn, GenericFilter, MillisNone, NumberNone } from '../../filtering'
import { BooleanDataFilter } from './BooleanDataFilter'
import { DateDataFilter } from './DateDataFilter'
import { NumberDataFilter } from './NumberDataFilter'
import { TextDataFilter } from './TextDataFilter'
import { Button, Grid } from '@mui/material'
import { DataDiagrams } from '../../containers/diagram/DataDiagrams'

const useStyles = makeStyles()((theme) => ({
  title: {
    marginLeft: theme.spacing(1),
    lineHeight: 1,
  },
  gridItem: {
    lineHeight: 1,
  },
  filter: {
    padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
  },
}))

interface DataFiltersProps {
  activeFilters: ReadonlyArray<GenericFilter>
  availableColumns: ReadonlyArray<FilterColumn>
  onAddFilter: (filter: GenericFilter) => void
  onRemoveFilter: (columnName: GenericFilter) => void
  onResetFilters: () => void
}

export const DataFilters = ({ activeFilters, availableColumns, onAddFilter, onResetFilters }: DataFiltersProps) => {
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
      <Grid container direction={'row'} alignItems={'center'}>
        <Grid className={classes.gridItem} item xs="auto">
          <FilterAltIcon />
        </Grid>
        <Grid className={classes.gridItem} item xs>
          <h3 className={classes.title}>Filters</h3>
        </Grid>
        <Grid className={classes.gridItem} item>
          <Button onClick={onResetFilters} disabled={activeFilters.length === 0}>
            Reset {activeFilters.length > 0 && `(${activeFilters.length})`}
          </Button>
        </Grid>
      </Grid>

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
                <DataDiagrams column={availableColumn} />
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
          case 'boolean':
            return (
              <div key={availableColumn.name} className={classes.filter}>
                <BooleanDataFilter
                  column={availableColumn}
                  type={availableColumn.type}
                  value={
                    findActiveFilter(availableColumn, activeFilters, availableColumn.type)?.value ?? {
                      isTrue: TrilianNone,
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
                <DataDiagrams column={availableColumn} />
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
