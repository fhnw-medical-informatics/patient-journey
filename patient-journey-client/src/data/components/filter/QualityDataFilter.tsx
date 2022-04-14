import React from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter, QualityFilterNone } from '../../filtering'
import { DataColumn } from '../../columns'
import { useUniqueActiveDataQualities } from '../../hooks'

export interface QualityDataFilterProps extends Filter<'quality'> {
  column: DataColumn<'quality'>
  onChange: (filter: Filter<'quality'>) => void
  onRemove: (filter: Filter<'quality'>) => void
}

export const QualityDataFilter = ({ column, type, value, onChange, onRemove }: QualityDataFilterProps) => {
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
      value={value.text !== QualityFilterNone ? value.text : QualityFilterNone}
      onChange={handleChange}
      label={column.name}
      fullWidth
    >
      <MenuItem value={QualityFilterNone}>
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
