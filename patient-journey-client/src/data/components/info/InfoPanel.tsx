import React from 'react'
import { Card, Typography } from '@mui/material'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    padding: theme.spacing(1),
  },
}))

export const InfoPanel = () => {
  const { classes } = useStyles()
  return (
    <Card className={classes.root}>
      <Typography variant="overline" padding={1}>
        {'Coming Soon'}
      </Typography>
    </Card>
  )
}
