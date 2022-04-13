import { Typography, useTheme } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../utils'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    heigth: '100%',
    gridTemplateColumns: 'auto 1fr',
    gridGap: theme.spacing(1),
    alignItems: 'center',
  },
}))

interface Props {
  readonly isActive: boolean
  readonly children: React.ReactNode
}

export const ColorLegend = ({ isActive, children }: Props) => {
  const theme = useTheme()
  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      <Typography
        variant="overline"
        padding={1}
        color={isActive ? theme.palette.text.primary : theme.palette.text.disabled}
      >
        {'Color Scale'}
      </Typography>
      {children}
    </div>
  )
}
