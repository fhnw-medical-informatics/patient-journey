import React from 'react'

import { FormGroup, TextField } from '@mui/material'
import { createFilter, Filter } from '../../filtering'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  container: {
    '> *:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  input: {
    maxWidth: '100px',
  },
}))

export interface NumberDataFilterProps extends Filter<'number'> {
  onChange: (filter: Filter<'number'>) => void
  onRemove: (filter: Filter<'number'>) => void
}

export const NumberDataFilter = ({ column, type, value, onChange, onRemove }: NumberDataFilterProps) => {
  const { classes } = useStyles()

  const handleChange = (fromValue: number | null, toValue: number | null) => {
    const filter = createFilter(column, type, {
      from: fromValue !== null ? fromValue : value.from,
      to: toValue !== null ? toValue : value.to,
    })

    if (isNaN(filter.value.from) && isNaN(filter.value.to)) {
      onRemove(filter)
    } else {
      onChange(filter)
    }
  }

  return (
    <FormGroup className={classes.container}>
      <div className={classes.input}>
        <TextField
          label={'From'}
          variant="outlined"
          type={'number'}
          value={!isNaN(value.from) ? value.from : 'NaN'}
          onChange={(event) => {
            handleChange(event.target.value ? +event.target.value : NaN, null)
          }}
          InputLabelProps={{ shrink: true }}
        />
      </div>
      <div className={classes.input}>
        <TextField
          label={'To'}
          variant="outlined"
          type={'number'}
          value={!isNaN(value.to) ? value.to : 'NaN'}
          onChange={(event) => {
            handleChange(null, event.target.value ? +event.target.value : NaN)
          }}
          InputLabelProps={{ shrink: true }}
        />
      </div>
    </FormGroup>
  )
}
