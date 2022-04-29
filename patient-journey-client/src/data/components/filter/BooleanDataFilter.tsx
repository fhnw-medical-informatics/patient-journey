import React from 'react'

import { FormGroup, ToggleButton, ToggleButtonGroup } from '@mui/material'
import Check from '@mui/icons-material/Check'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'

import { TrilianNone, createFilter, Filter } from '../../filtering'

export interface BooleanDataFilterProps extends Filter<'boolean'> {
  onChange: (filter: Filter<'boolean'>) => void
  onRemove: (filter: Filter<'boolean'>) => void
}

export const BooleanDataFilter = ({ column, type, value, onChange, onRemove }: BooleanDataFilterProps) => {
  const handleChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: any) => {
    const filter = createFilter(column, type, { isTrue: newValue })

    if (filter.value.isTrue !== TrilianNone) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  return (
    <FormGroup>
      <ToggleButtonGroup value={value.isTrue} exclusive onChange={handleChange} aria-label="device">
        <ToggleButton value={TrilianNone}>None</ToggleButton>
        <ToggleButton value={true}>
          <Check />
        </ToggleButton>
        <ToggleButton value={false}>
          <CheckBoxOutlineBlankIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </FormGroup>
  )
}
