import React from 'react'

import { Card, CardContent, Grid, Typography, useTheme, Button } from '@mui/material'

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
        {isActive && (
          <Grid item>
            <Button variant="text" onClick={onRemove} disabled={!isActive}>
              Clear
            </Button>
          </Grid>
        )}
      </Grid>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
