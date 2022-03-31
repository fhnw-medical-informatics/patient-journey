import React from 'react'

import { FormGroup, TextField } from '@mui/material'
import { createFilter, Filter, Millis, MillisNone } from '../../filtering'
import { makeStyles } from '../../../utils'
import { format, isValidDate, parseHTMLDateInput } from '../../columns'

const CONTROL_TIMESTAMP_FORMAT = 'yyyy-MM-dd HH:mm'
const CONTROL_DATE_FORMAT = 'yyyy-MM-dd'

const useStyles = makeStyles()((theme) => ({
  container: {
    '> *:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  input: {
    maxWidth: '227px',
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

  const parseDateTextField = (input: string): Millis | null => {
    const dateInput = parseHTMLDateInput(input)

    if (!input || isValidDate(dateInput)) {
      return input ? dateInput.valueOf() : MillisNone
    } else {
      return null
    }
  }

  return (
    <FormGroup className={classes.container}>
      <div className={classes.input}>
        <TextField
          label={'From'}
          variant="outlined"
          type={type === 'timestamp' ? 'datetime-local' : 'date'}
          value={
            value.millisFrom !== MillisNone
              ? format(value.millisFrom, type === 'timestamp' ? CONTROL_TIMESTAMP_FORMAT : CONTROL_DATE_FORMAT)
              : ''
          }
          onChange={(event) => {
            handleChange(parseDateTextField(event.target.value), null)
          }}
          // Issue with shrink state: https://mui.com/components/text-fields/#shrink
          InputLabelProps={{ shrink: true }}
        />
      </div>
      <div className={classes.input}>
        <TextField
          label={'To'}
          variant="outlined"
          type={type === 'timestamp' ? 'datetime-local' : 'date'}
          value={
            value.millisTo !== MillisNone
              ? format(value.millisTo, type === 'timestamp' ? CONTROL_TIMESTAMP_FORMAT : CONTROL_DATE_FORMAT)
              : ''
          }
          onChange={(event) => {
            handleChange(null, parseDateTextField(event.target.value))
          }}
          // Issue with shrink state https://mui.com/components/text-fields/#shrink
          InputLabelProps={{ shrink: true }}
        />
      </div>
    </FormGroup>
  )
}
