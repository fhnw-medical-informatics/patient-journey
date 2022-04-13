import React from 'react'
import { Typography, useTheme } from '@mui/material'

interface Props {
  readonly isActive?: boolean
}

export const NoColoringLabel = ({ isActive = true }: Props) => {
  const theme = useTheme()
  return (
    <Typography color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}>
      <i>{'Off'}</i>
    </Typography>
  )
}
