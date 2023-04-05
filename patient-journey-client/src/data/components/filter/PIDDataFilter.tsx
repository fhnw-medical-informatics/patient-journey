import React from 'react'

import { Button, Stack, TextField } from '@mui/material'

import { createFilter, Filter } from '../../filtering'
import { EntityId, EntityIdNone } from '../../entities'

export interface PIDDataFilterProps extends Filter<'pid'> {
  selectedPatientPID: EntityId
  onChange: (filter: Filter<'pid'>) => void
  onRemove: (filter: Filter<'pid'>) => void
}

export const PIDDataFilter = ({ selectedPatientPID, column, type, value, onChange, onRemove }: PIDDataFilterProps) => {
  const handleChange = (value: string) => {
    const filter = createFilter(column, type, { text: value })

    if (value) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  const handleTextFieldChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    handleChange(event.target.value)
  }

  return (
    <Stack spacing={1} direction="column">
      <TextField
        label={column.name}
        variant="filled"
        size="small"
        value={value.text}
        onChange={handleTextFieldChange}
        InputLabelProps={{ shrink: true }}
        sx={{ width: '100%' }}
      />
      {selectedPatientPID !== EntityIdNone && (
        <Button
          variant="text"
          onClick={() => handleChange(selectedPatientPID)}
          disabled={value.text === selectedPatientPID}
          size="small"
        >
          Isolate selected patient {selectedPatientPID}
        </Button>
      )}
    </Stack>
  )
}
