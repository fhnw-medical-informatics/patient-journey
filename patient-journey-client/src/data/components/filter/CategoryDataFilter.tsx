import React from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter } from '../../filtering'
import { DataColumn } from '../../columns'
import { Checkbox, FormControl, InputLabel, ListItemText } from '@mui/material'
import { useCategories } from '../diagram/hooks'
import { Entity } from '../../entities'
import { makeStyles } from '../../../utils'
import { ColorLegendCategoryCircle } from '../../../color/containers/ColorLegendCategoryCircle'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
}))

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
  const { classes } = useStyles()
  const { uniqueCategories } = useCategories(allActiveData, column as DataColumn<'category'>)

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const selected = event.target.value as unknown as string[]
    const filter = createFilter(column, type, { categories: selected })

    if (selected.length > 0) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  const renderValue = () => {
    switch (value.categories.length) {
      case 0:
        return null
      case 1:
        return value.categories[0]
      default:
        return <i>{`${activeFilterCategories.length} Selected`}</i>
    }
  }

  const activeFilterCategories = value.categories.length !== 0 ? value.categories : []

  return (
    <FormControl variant="filled" size="small" className={classes.container}>
      <InputLabel id={column.name}>{column.name}</InputLabel>
      <Select
        multiple
        value={activeFilterCategories}
        onChange={handleChange}
        label={column.name}
        labelId={column.name}
        renderValue={renderValue}
        displayEmpty={true}
      >
        {uniqueCategories.map((c) => {
          const checked = activeFilterCategories.indexOf(c) > -1
          return (
            <MenuItem key={c} value={c}>
              <Checkbox checked={checked} />
              <ListItemText primary={c} />
              <ColorLegendCategoryCircle column={column} category={c} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
