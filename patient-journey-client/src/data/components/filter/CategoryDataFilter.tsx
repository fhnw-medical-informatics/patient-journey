import React from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter, CategoryFilterNone } from '../../filtering'
import { DataColumn } from '../../columns'
import { useUniqueActiveDataQualities } from '../../hooks'

export interface CategoryDataFilterProps extends Filter<'category'> {
  column: DataColumn<'category'>
  onChange: (filter: Filter<'category'>) => void
  onRemove: (filter: Filter<'category'>) => void
}

export const CategoryDataFilter = ({ column, type, value, onChange, onRemove }: CategoryDataFilterProps) => {
  const uniqueQualities = useUniqueActiveDataQualities(column)

  const handleChange = (event: SelectChangeEvent) => {
    const filter = createFilter(column, type, { text: event.target.value })

    if (event.target.value) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  return (
    <Select
      value={value.text !== CategoryFilterNone ? value.text : CategoryFilterNone}
      onChange={handleChange}
      label={column.name}
      fullWidth
    >
      <MenuItem value={CategoryFilterNone}>
        <i>{'None'}</i>
      </MenuItem>
      {uniqueQualities.map((q) => (
        <MenuItem key={q} value={q}>
          {q}
        </MenuItem>
      ))}
    </Select>
  )
}
