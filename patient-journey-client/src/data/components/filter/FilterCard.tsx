import React from 'react'

import { Card, CardContent, Grid, Typography, IconButton, useTheme } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

export interface FilterCardProps {
  label: string
  isActive: boolean
  onRemove: () => void
  children: React.ReactNode
}

export const FilterCard = ({ label, isActive, onRemove, children }: FilterCardProps) => {
  const theme = useTheme()

  return (
    <Card>
      <Grid container direction={'row'} alignItems={'center'} padding={1}>
        <Grid item xs>
          <Typography
            color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}
            variant="overline"
            padding={1}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={onRemove} disabled={!isActive}>
            <HighlightOffIcon />
          </IconButton>
        </Grid>
      </Grid>
      <CardContent sx={{ '> *:not(:last-child)': { marginBottom: theme.spacing(3) } }}>{children}</CardContent>
    </Card>
  )
}
