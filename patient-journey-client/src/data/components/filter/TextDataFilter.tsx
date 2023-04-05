import React from 'react'

import { TextField } from '@mui/material'

import { createFilter, Filter } from '../../filtering'

export interface TextDataFilterProps extends Filter<'string'> {
  onChange: (filter: Filter<'string'>) => void
  onRemove: (filter: Filter<'string'>) => void
}

export const TextDataFilter = ({ column, type, value, onChange, onRemove }: TextDataFilterProps) => {
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
      variant="filled"
      size="small"
      value={value.text}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      sx={{ width: '100%' }}
    />
  )
}
