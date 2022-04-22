import React from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter } from '../../filtering'
import { DataColumn } from '../../columns'
import { useUniqueActiveDataQualities } from '../../hooks'
import { Checkbox, FormControl, InputLabel, ListItemText } from '@mui/material'

export interface QualityDataFilterProps extends Filter<'quality'> {
  column: DataColumn<'quality'>
  onChange: (filter: Filter<'quality'>) => void
  onRemove: (filter: Filter<'quality'>) => void
}

export const QualityDataFilter = ({ column, type, value, onChange, onRemove }: QualityDataFilterProps) => {
  const uniqueQualities = useUniqueActiveDataQualities(column)

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const selected = event.target.value as unknown as string[]
    const filter = createFilter(column, type, { qualities: selected })

    if (selected.length > 0) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  const renderValue = () => {
    switch (value.qualities.length) {
      case 0:
        return null
      case 1:
        return value.qualities[0]
      default:
        return <i>{`${activeFilterCategories.length} Selected`}</i>
    }
  }

  const activeFilterCategories = value.qualities !== [''] ? value.qualities : []

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
        {uniqueQualities.map((q) => {
          const checked = activeFilterCategories.indexOf(q) > -1
          return (
            <MenuItem key={q} value={q}>
              <Checkbox checked={checked} />
              <ListItemText primary={q} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
