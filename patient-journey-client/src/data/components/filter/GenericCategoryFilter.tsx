import React, { useCallback, useMemo } from 'react'

import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import { createFilter, Filter } from '../../filtering'
import { Chip, FormControl } from '@mui/material'
import { makeStyles } from '../../../utils'
import { ColorLegendCategoryCircle } from '../../../color/containers/ColorLegendCategoryCircle'
import { useColor } from '../../../color/hooks'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  listItem: {
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: 'auto 1fr auto',
    paddingRight: theme.spacing(1),
  },
  chipAvatar: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
}))

export interface GenericDataFilterProps<T extends 'pid' | 'category'> extends Filter<T> {
  uniqueData: ReadonlyArray<string>
  createValue: (selected: string[]) => Filter<T>['value']
  extractValue: (filter: Filter<T>['value']) => string[]
  onChange: (filter: Filter<T>) => void
  onRemove: (filter: Filter<T>) => void
  children?: (handleChange: (values: string[]) => void) => React.ReactNode
}

export const GenericDataFilter = <T extends 'pid' | 'category'>({
  uniqueData,
  column,
  type,
  value,
  createValue,
  extractValue,
  onChange,
  onRemove,
  children,
}: GenericDataFilterProps<T>) => {
  const { classes } = useStyles()
  const { colorByColumn } = useColor()

  const handleChange = useCallback(
    (selected: string[]) => {
      const filter = createFilter(column, type, createValue(selected))

      if (selected.length > 0) {
        onChange(filter)
      } else {
        onRemove(filter)
      }
    },
    [createValue, onChange, onRemove, column, type]
  )

  const activeFilterData = useMemo(() => {
    const activeDataField = extractValue(value)
    return activeDataField.length !== 0 ? activeDataField : []
  }, [value, extractValue])

  return (
    <FormControl variant="filled" size="small" className={classes.container}>
      <Autocomplete
        multiple
        value={activeFilterData}
        onChange={(e, selected) => {
          handleChange(selected)
        }}
        options={uniqueData}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        renderOption={(props, option, { selected }) => (
          <li {...props} className={classes.listItem}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
            <ColorLegendCategoryCircle column={column} category={option} />
          </li>
        )}
        renderInput={(params) => <TextField {...params} variant="filled" label={column.name} placeholder="Select…" />}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              avatar={
                column === colorByColumn.column ? (
                  <div className={classes.chipAvatar}>
                    <ColorLegendCategoryCircle column={column} category={option} />
                  </div>
                ) : undefined
              }
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
      />
      {children && children(handleChange)}
    </FormControl>
  )
}
