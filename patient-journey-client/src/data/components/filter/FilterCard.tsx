import React from 'react'

import { Card, CardContent, Grid, Typography, useTheme, Button, SxProps, Theme } from '@mui/material'

export interface FilterCardProps {
  label: string
  isActive: boolean
  onRemove: () => void
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export const FilterCard = ({ label, isActive, onRemove, children, sx }: FilterCardProps) => {
  const theme = useTheme()

  return (
    <Card
      elevation={theme.palette.mode === 'dark' ? (!isActive ? 3 : 0) : isActive ? 9 : 1}
      sx={{ overflow: 'visible', ...sx }}
    >
      <Grid container direction={'row'} alignItems={'center'} padding={1}>
        <Grid item xs>
          <div>
            <Typography
              color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}
              variant="button"
              padding={theme.spacing(1)}
              sx={{
                display: 'flex',
              }}
            >
              {label}
            </Typography>
          </div>
        </Grid>
        <Grid item>
          {isActive && (
            <Button variant="text" onClick={onRemove} disabled={!isActive}>
              Clear
            </Button>
          )}
        </Grid>
      </Grid>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
