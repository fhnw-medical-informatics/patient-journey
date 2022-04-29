import React from 'react'

import { FormGroup, TextField, Slider, Grid } from '@mui/material'
import { createFilter, Filter } from '../../filtering'
import { makeStyles } from '../../../utils'
import { DataColumn } from '../../columns'
import { Entity } from '../../entities'
import { useNumbers } from '../diagram/hooks'

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
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'number'>) => void
  onRemove: (filter: Filter<'number'>) => void
}

export const NumberDataFilter = ({ allActiveData, column, type, value, onChange, onRemove }: NumberDataFilterProps) => {
  const { classes } = useStyles()

  const { min, max } = useNumbers(allActiveData, column as DataColumn<'number'>)

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

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      handleChange(newValue[0], newValue[1])
    }
  }

  return (
    <FormGroup className={classes.container}>
      <Slider
        value={[!isNaN(value.from) ? value.from : min!, !isNaN(value.to) ? value.to : max!]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={min}
        max={max}
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
                  type={'number'}
                  value={!isNaN(value.from) ? value.from : 'NaN'}
                  onChange={(event) => {
                    handleChange(event.target.value ? +event.target.value : NaN, null)
                  }}
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
                  type={'number'}
                  value={!isNaN(value.to) ? value.to : 'NaN'}
                  onChange={(event) => {
                    handleChange(null, event.target.value ? +event.target.value : NaN)
                  }}
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
