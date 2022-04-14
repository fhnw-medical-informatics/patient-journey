import React, { useMemo } from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter, QualityFilterNone } from '../../filtering'
import { Entity } from '../../entities'
import { DataColumn, extractQualityValueSafe } from '../../columns'

export interface QualityDataFilterProps extends Filter<'quality'> {
  column: DataColumn<'quality'>
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'quality'>) => void
  onRemove: (filter: Filter<'quality'>) => void
}

export const QualityDataFilter = ({
  column,
  allActiveData,
  type,
  value,
  onChange,
  onRemove,
}: QualityDataFilterProps) => {
  const extractValueSafe = useMemo(() => extractQualityValueSafe(column), [column])
  const allQualities = useMemo(() => allActiveData.flatMap(extractValueSafe), [allActiveData, extractValueSafe])
  const qualities = useMemo(() => [...new Set(allQualities)], [allQualities])

  const handleChange = (event: SelectChangeEvent) => {
    const filter = createFilter(column, type, { text: event.target.value })

    if (event.target.value) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  return (
    <Select
      value={value.text !== QualityFilterNone ? value.text : QualityFilterNone}
      onChange={handleChange}
      label={column.name}
      fullWidth
    >
      <MenuItem value={QualityFilterNone}>
        <i>{'None'}</i>
      </MenuItem>
      {qualities.map((q) => (
        <MenuItem key={q} value={q}>
          {q}
        </MenuItem>
      ))}
    </Select>
  )
}
