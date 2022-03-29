import React from 'react'

import { alpha, FormGroup, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ActiveDataViewType } from '../dataSlice'
import { makeStyles } from '../../utils'

const useStyles = makeStyles()((theme) => ({
  button: {
    color: 'white',
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: alpha(theme.palette.action.active, 0.4),
    },
  },
}))

export interface DataViewSelectorProps {
  activeDataView: ActiveDataViewType
  onChangeDataView: (view: ActiveDataViewType) => void
}

export const DataViewSelector = ({ activeDataView, onChangeDataView }: DataViewSelectorProps) => {
  const { classes } = useStyles()

  const handleChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: any) => {
    onChangeDataView(newValue)
  }

  return (
    <FormGroup>
      <ToggleButtonGroup value={activeDataView} exclusive onChange={handleChange}>
        <ToggleButton value={'patients'} className={classes.button}>
          Patients
        </ToggleButton>
        <ToggleButton value={'events'} className={classes.button}>
          Events
        </ToggleButton>
      </ToggleButtonGroup>
    </FormGroup>
  )
}
