import React from 'react'

import { TextField } from '@mui/material'

import { createFilter, Filter } from '../../filtering'

export interface QualityDataFilterProps extends Filter<'quality'> {
  onChange: (filter: Filter<'quality'>) => void
  onRemove: (filter: Filter<'quality'>) => void
}

export const QualityDataFilter = ({ column, type, value, onChange, onRemove }: QualityDataFilterProps) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const filter = createFilter(column, type, { text: event.target.value })

    if (event.target.value) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  return (
    <TextField
      label={column.name}
      variant="outlined"
      value={value.text}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
    />
  )
}
