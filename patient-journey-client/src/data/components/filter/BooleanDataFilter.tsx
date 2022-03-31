import React from 'react'

import { FormGroup, ToggleButton, ToggleButtonGroup } from '@mui/material'
import Check from '@mui/icons-material/Check'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

import { TrilianNone, createFilter, Filter } from '../../filtering'

export interface BooleanDataFilterProps extends Filter<'boolean'> {
  onChange: (filter: Filter<'boolean'>) => void
}

export const BooleanDataFilter = ({ column, type, value, onChange }: BooleanDataFilterProps) => {
  const handleChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: any) => {
    onChange(createFilter(column, type, { isTrue: newValue }))
  }

  return (
    <FormGroup>
      <ToggleButtonGroup value={value.isTrue} exclusive onChange={handleChange} aria-label="device">
        <ToggleButton value={TrilianNone} aria-label="laptop">
          None
        </ToggleButton>
        <ToggleButton value={true} aria-label="tv">
          <Check />
        </ToggleButton>
        <ToggleButton value={false} aria-label="phone">
          <CheckBoxOutlineBlankIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </FormGroup>
  )
}
