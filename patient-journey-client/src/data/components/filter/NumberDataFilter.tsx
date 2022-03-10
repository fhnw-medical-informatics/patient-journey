import React from 'react'

import { FormGroup, FormLabel, TextField } from '@mui/material'
import { createFilter, Filter } from '../../filtering'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  label: {
    margin: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  input: {
    maxWidth: '100px',
    paddingBottom: theme.spacing(1),
  },
}))

export interface NumberDataFilterProps extends Filter<'number'> {
  onChange: (filter: Filter<'number'>) => void
}

export const NumberDataFilter = ({ column, type, value, onChange }: NumberDataFilterProps) => {
  const { classes } = useStyles()

  const handleChange = (fromValue: number | null, toValue: number | null) => {
    onChange(
      createFilter(column, type, {
        from: fromValue !== null ? fromValue : value.from,
        to: toValue !== null ? toValue : value.to,
      })
    )
  }

  return (
    <FormGroup>
      <FormLabel className={classes.label}>{column.name}</FormLabel>
      <TextField
        className={classes.input}
        label={'From'}
        variant="outlined"
        type={'number'}
        value={!isNaN(value.from) ? value.from : 'NaN'}
        onChange={(event) => {
          handleChange(event.target.value ? +event.target.value : NaN, null)
        }}
      />
      <TextField
        className={classes.input}
        label={'To'}
        variant="outlined"
        type={'number'}
        value={!isNaN(value.to) ? value.to : 'NaN'}
        onChange={(event) => {
          handleChange(null, event.target.value ? +event.target.value : NaN)
        }}
      />
    </FormGroup>
  )
}
