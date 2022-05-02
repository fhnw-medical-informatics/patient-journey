import React, { useCallback } from 'react'

import { FormGroup, TextField, Grid } from '@mui/material'
import { createFilter, Filter, Millis, MillisNone } from '../../filtering'
import { makeStyles } from '../../../utils'
import { DataColumn, DATE_FORMAT, DATE_TIMESTAMP_FORMAT, format, isValidDate, parseHTMLDateInput } from '../../columns'
import { Entity } from '../../entities'
import { useDates } from '../diagram/hooks'
import { CustomSliderThumb } from './slider/CustomSliderThumb'
import { CustomSlider } from './slider/CustomSlider'

const CONTROL_TIMESTAMP_FORMAT = 'yyyy-MM-dd HH:mm'
const CONTROL_DATE_FORMAT = 'yyyy-MM-dd'

const useStyles = makeStyles()(() => ({
  input: {
    width: '100%',
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

  const handleChange = useCallback(
    (fromValue: Millis | null, toValue: Millis | null) => {
      const _millisTo = toValue !== null ? toValue : value.millisTo

      const filter = createFilter(column, type, {
        millisFrom: fromValue !== null ? fromValue : value.millisFrom,
        millisTo: _millisTo,
        toInclusive: _millisTo === max!.valueOf(),
      })

      if (filter.value.millisFrom === MillisNone && filter.value.millisTo === MillisNone) {
        onRemove(filter)
      } else {
        onChange(filter)
      }
    },
    [column, max, onChange, onRemove, type, value]
  )

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
    <FormGroup>
      <CustomSlider
        value={[
          value.millisFrom !== MillisNone ? value.millisFrom : min!.valueOf(),
          value.millisTo !== MillisNone ? value.millisTo : max!.valueOf(),
        ]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={min!.valueOf()}
        max={max!.valueOf()}
        valueLabelFormat={(value) => format(value, type === 'timestamp' ? DATE_TIMESTAMP_FORMAT : DATE_FORMAT)}
        size="small"
        components={{
          Thumb: CustomSliderThumb,
        }}
      />
      <Grid container spacing={1} direction="row">
        <Grid item xs={6}>
          <Grid container justifyContent="flex-start">
            <Grid item className={classes.input}>
              <TextField
                fullWidth
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
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <Grid item className={classes.input}>
              <TextField
                fullWidth
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormGroup>
  )
}
