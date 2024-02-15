import React from 'react'

import { FormControl, Grid, MenuItem, Select, Typography } from '@mui/material'

import { EntityType } from '../../data/entities'

interface Props {
  readonly label: string
  readonly activeEntityType: EntityType
  readonly onChange: (entityType: EntityType) => void
}

export const EntityTypeSelector = ({ label, activeEntityType, onChange }: Props) => {
  return (
    <Grid item>
      <Typography variant="overline" display="block">
        {label}
      </Typography>
      <FormControl>
        <Select
          size={'small'}
          value={activeEntityType}
          onChange={(event) => onChange(event.target.value as EntityType)}
        >
          {['patients', 'events'].map((type) => {
            return (
              <MenuItem key={type} value={type}>
                {type === 'patients' ? 'Patients' : 'Events'}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </Grid>
  )
}
