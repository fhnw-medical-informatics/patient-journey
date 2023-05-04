import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
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
    <FormControl variant="filled" size="small">
      <InputLabel id="label-id">{label}</InputLabel>
      <Select
        labelId="label-id"
        size={'small'}
        value={colToStringValue(activeColumn)}
        label={label}
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
  )
}
