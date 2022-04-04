import React, { useCallback, useMemo } from 'react'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { createFilter, Filter } from '../../filtering'
import { Entity } from '../../entities'

export interface QualityDataFilterProps extends Filter<'quality'> {
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
  const extractValueUndefinedSafe = useCallback(
    (d: Entity) => {
      const value = d.values[column.index] ?? ''

      if (value === undefined || value.trim().length === 0) {
        return []
      }

      switch (column.type) {
        case 'quality':
          return [value]
        default:
          throw new Error('Unsupported Format')
      }
    },
    [column]
  )

  const allQualities = useMemo(
    () => allActiveData.flatMap(extractValueUndefinedSafe),
    [allActiveData, extractValueUndefinedSafe]
  )

  const uniqueQualities = allQualities.filter((v, i, a) => a.indexOf(v) === i)

  const handleChange = (event: SelectChangeEvent) => {
    const filter = createFilter(column, type, { text: event.target.value })

    if (event.target.value) {
      onChange(filter)
    } else {
      onRemove(filter)
    }
  }

  return (
    <Select value={value.text} onChange={handleChange} label={column.name} fullWidth>
      {uniqueQualities.map((q) => (
        <MenuItem key={q} value={q}>
          {q}
        </MenuItem>
      ))}
    </Select>
  )
}
