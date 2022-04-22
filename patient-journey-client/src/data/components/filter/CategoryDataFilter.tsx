import React from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter } from '../../filtering'
import { DataColumn } from '../../columns'
import { useUniqueActiveDataCategories } from '../../hooks'
import { Checkbox, FormControl, InputLabel, ListItemText } from '@mui/material'

export interface CategoryDataFilterProps extends Filter<'category'> {
  column: DataColumn<'category'>
  onChange: (filter: Filter<'category'>) => void
  onRemove: (filter: Filter<'category'>) => void
}

export const CategoryDataFilter = ({ column, type, value, onChange, onRemove }: CategoryDataFilterProps) => {
  const uniqueCategories = useUniqueActiveDataCategories(column)

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

  const activeFilterCategories = value.categories !== [''] ? value.categories : []

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={column.name}>{column.name}</InputLabel>
      <Select
        multiple
        value={activeFilterCategories}
        onChange={handleChange}
        label={column.name}
        labelId={column.name}
        renderValue={renderValue}
        variant="outlined"
        displayEmpty={true}
      >
        {uniqueCategories.map((c) => {
          const checked = activeFilterCategories.indexOf(c) > -1
          return (
            <MenuItem key={c} value={c}>
              <Checkbox checked={checked} />
              <ListItemText primary={c} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
