import { FormControl, Grid, MenuItem, Select, Typography } from '@mui/material'
import { PlotColumnNone, ScatterPlotAxisColumn } from '../plotSlice'
import React from 'react'

interface Props {
  readonly label: string
  readonly activeColumn: ScatterPlotAxisColumn
  readonly allSelectableColumns: ReadonlyArray<ScatterPlotAxisColumn>
  readonly onChange: (column: ScatterPlotAxisColumn) => void
}

const colToStringValue = (col: ScatterPlotAxisColumn) => (col === PlotColumnNone ? PlotColumnNone : col.name)

export const ColumnSelector = ({ label, activeColumn, allSelectableColumns, onChange }: Props) => {
  const columnsByName = new Map(allSelectableColumns.map((c) => [colToStringValue(c), c]))

  return (
    <Grid item>
      <Typography variant="overline" display="block">
        {label}
      </Typography>
      <FormControl>
        <Select
          size={'small'}
          value={colToStringValue(activeColumn)}
          onChange={(event) => onChange(columnsByName.get(event.target.value) ?? PlotColumnNone)}
        >
          {allSelectableColumns.map((column) => {
            const v = colToStringValue(column)
            return (
              <MenuItem key={v} value={v}>
                {v === PlotColumnNone ? '–' : v}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </Grid>
  )
}
