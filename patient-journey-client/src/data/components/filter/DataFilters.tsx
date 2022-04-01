import React from 'react'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { makeStyles } from '../../../utils'
import { Filter, FilterColumn, GenericFilter } from '../../filtering'
import { Button, Grid, Typography } from '@mui/material'
import { DataDiagrams } from '../diagram/DataDiagrams'
import { Entity } from '../../entities'
import { DataFilter } from './DataFilter'
import { FilterCard } from './FilterCard'
import { ActiveDataViewType } from '../../dataSlice'
import { ColorByColumnOption } from '../../../color/colorSlice'
import { ColorByNumberFn } from '../../../color/useColor'

const useStyles = makeStyles()((theme) => ({
  title: {
    marginLeft: theme.spacing(1),
    lineHeight: 1,
  },
  gridItem: {
    lineHeight: 1,
  },
}))

interface DataFiltersProps {
  activeView: ActiveDataViewType
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  activeFilters: ReadonlyArray<GenericFilter>
  availableColumns: ReadonlyArray<FilterColumn>
  onAddFilter: (filter: GenericFilter) => void
  onRemoveFilter: (filter: GenericFilter) => void
  onResetFilters: () => void
  colorByColumn: ColorByColumnOption
  colorByNumberFn: ColorByNumberFn
}

export const DataFilters = ({
  activeView,
  allActiveData,
  filteredActiveData,
  activeFilters,
  availableColumns,
  onAddFilter,
  onRemoveFilter,
  onResetFilters,
  colorByColumn,
  colorByNumberFn,
}: DataFiltersProps) => {
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

  const otherFilters = activeFilters.filter(
    (filter) => availableColumns.findIndex((column) => column.name === filter.column.name) === -1
  )

  return (
    <Grid container spacing={1} alignContent="flex-start">
      <Grid item xs={12}>
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
      </Grid>
      {otherFilters.length > 0 && (
        <Grid item xs={12}>
          <FilterCard
            label={`${activeView === 'patients' ? 'Event' : 'Patient'} Filters`}
            isActive={true}
            onRemove={() => {
              otherFilters.forEach((filter) => {
                onRemoveFilter(filter)
              })
            }}
          >
            <Typography>
              {activeView === 'patients' ? 'Patient' : 'Event'} results are limited by{' '}
              <strong>
                {otherFilters.length} active {activeView === 'patients' ? 'event' : 'patient'} filter
                {otherFilters.length > 1 ? 's' : ''}
              </strong>
              .
            </Typography>
          </FilterCard>
        </Grid>
      )}
      {availableColumns
        .filter((col) => ['string', 'number', 'boolean', 'date', 'timestamp'].includes(col.type))
        .map((availableColumn) => {
          const filter = findActiveFilter(availableColumn, activeFilters, availableColumn.type)

          return (
            <Grid item key={availableColumn.name} xs={12}>
              <FilterCard
                label={availableColumn.name}
                isActive={filter !== undefined}
                onRemove={() => {
                  filter && onRemoveFilter(filter)
                }}
              >
                <DataDiagrams
                  column={availableColumn}
                  allActiveData={allActiveData}
                  filteredActiveData={filteredActiveData}
                  colorByColumn={colorByColumn}
                  colorByNumberFn={colorByNumberFn}
                />
                <DataFilter
                  column={availableColumn}
                  type={availableColumn.type}
                  filter={filter}
                  onAddFilter={onAddFilter}
                  onRemoveFilter={onRemoveFilter}
                />
              </FilterCard>
            </Grid>
          )
        })}
    </Grid>
  )
}
