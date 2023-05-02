import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { PlotColumnNone, ScatterPlotAxisColumn, ScatterPlotCategoryColumn } from '../plotSlice'
import React from 'react'

interface Props<C> {
  readonly label: string
  readonly activeColumn: C
  readonly allSelectableColumns: ReadonlyArray<C>
  readonly onChange: (column: C) => void
}

const colToStringValue = (col: ScatterPlotAxisColumn | ScatterPlotCategoryColumn) =>
  col === PlotColumnNone ? PlotColumnNone : col.name

export const ColumnSelector = <C extends ScatterPlotAxisColumn | ScatterPlotCategoryColumn>({
  label,
  activeColumn,
  allSelectableColumns,
  onChange,
}: Props<C>) => {
  const columnsByName = new Map(allSelectableColumns.map((c) => [colToStringValue(c), c]))

  return (
    <FormControl variant="filled" size="small">
      <InputLabel id="label-id">{label}</InputLabel>
      <Select
        labelId="label-id"
        size={'small'}
        value={colToStringValue(activeColumn)}
        label={label}
        onChange={(event) => onChange(columnsByName.get(event.target.value) ?? (PlotColumnNone as C))}
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
