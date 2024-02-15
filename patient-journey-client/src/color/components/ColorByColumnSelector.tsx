import { FormControl, Grid, ListSubheader, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { ColorByColumn, ColorByColumnNone, ColorByColumnOptionNone } from '../colorSlice'
import React from 'react'
import { EventDataColumn } from '../../data/events'
import { PatientDataColumn } from '../../data/patients'

interface Props {
  readonly colorByColumn: ColorByColumn
  readonly eventDataColumns: ReadonlyArray<EventDataColumn>
  readonly patientDataColumns: ReadonlyArray<PatientDataColumn>
  readonly onChangeColorByColumn: (colorByColumn: ColorByColumn) => void
}

export const ColorByColumnSelector = ({
  colorByColumn,
  eventDataColumns,
  patientDataColumns,
  onChangeColorByColumn,
}: Props) => {
  const handleChangeColorByColumn = (event: SelectChangeEvent) => {
    if (event.target.value.startsWith('patients_')) {
      const column = patientDataColumns.find((column) => column.name === event.target.value.replace('patients_', ''))
      onChangeColorByColumn(column ? { type: 'patients', column } : ColorByColumnNone)
    } else if (event.target.value.startsWith('events_')) {
      const column = eventDataColumns.find((column) => column.name === event.target.value.replace('events_', ''))
      onChangeColorByColumn(column ? { type: 'events', column } : ColorByColumnNone)
    } else {
      onChangeColorByColumn(ColorByColumnNone)
    }
  }

  return (
    <Grid item>
      <Typography variant="overline" display="block">
        Color by
      </Typography>
      <FormControl>
        <Select
          value={
            colorByColumn.type !== 'none' && colorByColumn.column !== ColorByColumnOptionNone
              ? `${colorByColumn.type}_${colorByColumn.column.name}`
              : `${ColorByColumnNone.type}_${ColorByColumnNone.column}`
          }
          onChange={handleChangeColorByColumn}
          size="small"
        >
          <MenuItem value={`${ColorByColumnNone.type}_${ColorByColumnNone.column}`}>
            <i>{'Off'}</i>
          </MenuItem>
          <ListSubheader>Patient Columns</ListSubheader>
          {patientDataColumns
            .filter((column) => ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type))
            .map((column) => (
              <MenuItem key={column.name} value={'patients_' + column.name}>
                {column.name}
              </MenuItem>
            ))}
          <ListSubheader>Event Columns</ListSubheader>
          {eventDataColumns
            .filter((column) => ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type))
            .map((column) => (
              <MenuItem key={column.name} value={'events_' + column.name}>
                {column.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Grid>
  )
}
