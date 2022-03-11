import React from 'react'

import { FormGroup, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ActiveDataViewType } from '../dataSlice'

export interface DataViewSelectorProps {
  activeDataView: ActiveDataViewType
  onChangeDataView: (view: ActiveDataViewType) => void
}

export const DataViewSelector = ({ activeDataView, onChangeDataView }: DataViewSelectorProps) => {
  const handleChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: any) => {
    onChangeDataView(newValue)
  }

  return (
    <FormGroup>
      <ToggleButtonGroup value={activeDataView} exclusive onChange={handleChange} aria-label="device">
        <ToggleButton value={'patients'} aria-label="laptop">
          Patients
        </ToggleButton>
        <ToggleButton value={'events'} aria-label="tv">
          Events
        </ToggleButton>
      </ToggleButtonGroup>
    </FormGroup>
  )
}
