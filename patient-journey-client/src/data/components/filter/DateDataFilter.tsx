import React from 'react'

import { FormGroup, TextField, Slider, Grid } from '@mui/material'
import { createFilter, Filter, Millis, MillisNone } from '../../filtering'
import { makeStyles } from '../../../utils'
import { DataColumn, DATE_FORMAT, DATE_TIMESTAMP_FORMAT, format, isValidDate, parseHTMLDateInput } from '../../columns'
import { Entity } from '../../entities'
import { useDates } from '../diagram/hooks'

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
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'timestamp' | 'date'>) => void
  onRemove: (filter: Filter<'timestamp' | 'date'>) => void
}

export const DateDataFilter = ({ allActiveData, column, type, value, onChange, onRemove }: DateDataFilterProps) => {
  const { classes } = useStyles()

  const { min, max } = useDates(allActiveData, column as DataColumn<'timestamp' | 'date'>)

  const handleChange = (fromValue: Millis | null, toValue: Millis | null) => {
    const filter = createFilter(column, type, {
      millisFrom: fromValue !== null ? fromValue : value.millisFrom,
      millisTo: toValue !== null ? toValue : value.millisTo,
    })

    if (filter.value.millisFrom === MillisNone && filter.value.millisTo === MillisNone) {
      onRemove(filter)
    } else {
      onChange(filter)
    }
  }

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      handleChange(newValue[0], newValue[1])
    }
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
      <Slider
        value={[
          value.millisFrom !== MillisNone ? value.millisFrom : min!.valueOf(),
          value.millisTo !== MillisNone ? value.millisTo : max!.valueOf(),
        ]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={min!.valueOf()}
        max={max!.valueOf()}
        valueLabelFormat={(value) => format(value, type === 'timestamp' ? DATE_TIMESTAMP_FORMAT : DATE_FORMAT)}
      />
      <Grid container spacing={1} direction="row">
        <Grid item xs={6}>
          <Grid container justifyContent="flex-start">
            <Grid item>
              <div className={classes.input}>
                <TextField
                  label={'From'}
                  variant="filled"
                  size="small"
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
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <div className={classes.input}>
                <TextField
                  label={'To'}
                  variant="filled"
                  size="small"
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormGroup>
  )
}
