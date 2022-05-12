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
    if (newValue) {
      onChangeDataView(newValue)
    }
  }

  return (
    <FormGroup>
      <ToggleButtonGroup value={activeDataView} onChange={handleChange} exclusive size="small">
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
