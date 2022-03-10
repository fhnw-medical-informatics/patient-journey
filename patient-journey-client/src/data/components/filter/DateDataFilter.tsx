import React from 'react'

import { FormGroup, FormLabel, TextField } from '@mui/material'
import { createFilter, Filter, Millis, MillisNone } from '../../filtering'
import { makeStyles } from '../../../utils'
import { format, parseHTMLDateInput } from '../../columns'

const CONTROL_TIMESTAMP_FORMAT = 'yyyy-MM-dd HH:mm'
const CONTROL_DATE_FORMAT = 'yyyy-MM-dd'

const useStyles = makeStyles()((theme) => ({
  label: {
    margin: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  input: {
    maxWidth: '227px',
    paddingBottom: theme.spacing(1),
  },
}))

export interface DateDataFilterProps extends Filter<'timestamp' | 'date'> {
  onChange: (filter: Filter<'timestamp' | 'date'>) => void
}

export const DateDataFilter = ({ column, type, value, onChange }: DateDataFilterProps) => {
  const { classes } = useStyles()

  const handleChange = (fromValue: Millis | null, toValue: Millis | null) => {
    onChange(
      createFilter(column, type, {
        millisFrom: fromValue !== null ? fromValue : value.millisFrom,
        millisTo: toValue !== null ? toValue : value.millisTo,
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
        type={type === 'timestamp' ? 'datetime-local' : 'date'}
        value={
          value.millisFrom !== MillisNone
            ? format(value.millisFrom, type === 'timestamp' ? CONTROL_TIMESTAMP_FORMAT : CONTROL_DATE_FORMAT)
            : ''
        }
        onChange={(event) => {
          handleChange(event.target.value ? parseHTMLDateInput(event.target.value).valueOf() : MillisNone, null)
        }}
        // Issue with shrink state: https://mui.com/components/text-fields/#shrink
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        className={classes.input}
        label={'To'}
        variant="outlined"
        type={type === 'timestamp' ? 'datetime-local' : 'date'}
        value={
          value.millisTo !== MillisNone
            ? format(value.millisTo, type === 'timestamp' ? CONTROL_TIMESTAMP_FORMAT : CONTROL_DATE_FORMAT)
            : ''
        }
        onChange={(event) => {
          handleChange(null, event.target.value ? parseHTMLDateInput(event.target.value).valueOf() : MillisNone)
        }}
        // Issue with shrink state https://mui.com/components/text-fields/#shrink
        InputLabelProps={{ shrink: true }}
      />
    </FormGroup>
  )
}
