import React, { useCallback, useMemo } from 'react'

import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import { createFilter, Filter } from '../../filtering'
import { DataColumn } from '../../columns'
import { Chip, FormControl } from '@mui/material'
import { useCategories } from '../diagram/hooks'
import { Entity } from '../../entities'
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

export interface CategoryDataFilterProps extends Filter<'category'> {
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'category'>) => void
  onRemove: (filter: Filter<'category'>) => void
}

export const CategoryDataFilter = ({
  allActiveData,
  column,
  type,
  value,
  onChange,
  onRemove,
}: CategoryDataFilterProps) => {
  const { classes } = useStyles()
  const { uniqueCategories } = useCategories(allActiveData, column as DataColumn<'category'>)
  const { colorByColumn } = useColor()

  const handleChange = useCallback(
    (selected: string[]) => {
      const filter = createFilter(column, type, { categories: selected })

      if (selected.length > 0) {
        onChange(filter)
      } else {
        onRemove(filter)
      }
    },
    [onChange, onRemove, column, type]
  )

  const activeFilterCategories = useMemo(
    () => (value.categories.length !== 0 ? value.categories : []),
    [value.categories]
  )

  return (
    <FormControl variant="filled" size="small" className={classes.container}>
      <Autocomplete
        multiple
        value={activeFilterCategories}
        onChange={(e, selected) => {
          handleChange(selected)
        }}
        options={uniqueCategories}
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
    </FormControl>
  )
}
