import React from 'react'
import { makeStyles } from '../../utils'
import { Typography } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

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

interface Props {
  errorMessage: string
}

export const LoadingError = ({ errorMessage }: Props) => {
  const { classes } = useStyles()
  return (
    <div className={classes.centered}>
      <ErrorIcon fontSize={'large'} />
      <Typography className={classes.label} align={'center'}>
        {errorMessage}
        <br />
        <em>{'Check notifications and/or console for details'}</em>
      </Typography>
    </div>
  )
}
