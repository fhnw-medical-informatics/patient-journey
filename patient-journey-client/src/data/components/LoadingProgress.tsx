import React from 'react'
import { makeStyles } from '../../utils'
import { CircularProgress, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
  centered: {
    width: '100%',
    height: '100%',
    display: 'grid',
    alignItems: 'center',
    alignContent: 'center',
    justifyItems: 'center',
  },
  label: {
    paddingTop: theme.spacing(2),
  },
}))

export const LoadingProgress = () => {
  const { classes } = useStyles()
  return (
    <div className={classes.centered}>
      <CircularProgress size={100} color={'inherit'} />
      <Typography className={classes.label} align={'center'}>
        {'Loading data'}
      </Typography>
    </div>
  )
}
