import React from 'react'

import { TextField } from '@mui/material'

import { createFilter, Filter } from '../../filtering'

export interface TextDataFilterProps extends Filter<'string'> {
  onChange: (filter: Filter<'string'>) => void
}

export const TextDataFilter = ({ column, type, value, onChange }: TextDataFilterProps) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(createFilter(column, type, { text: event.target.value }))
  }

  return <TextField label={column.name} variant="outlined" value={value.text} onChange={handleChange} />
}
