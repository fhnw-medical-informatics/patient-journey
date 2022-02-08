import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { Typography } from '@mui/material'
import { makeStyles } from '../../utils'
import { Data } from '../../data'

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyItems: 'end',
  },
  main: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    padding: theme.spacing(1),
    paddingTop: 70,
  },
}))

export const App = () => {
  const { classes } = useStyles()
  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <Typography>{`Patient Journey – v${import.meta.env.VITE_APP_VERSION}`}</Typography>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <Data />
      </div>
    </>
  )
}
