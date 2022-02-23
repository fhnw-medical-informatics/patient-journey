import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { Typography, useTheme } from '@mui/material'
import { makeStyles } from '../../utils'
import { Data } from '../../data'
import { Timeline } from '../../timeline'
import SplitPane from 'react-split-pane'

const DEFAULT_SPLIT_PANE_SIZE = '75%'

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
  },
  top: {
    paddingTop: 70,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    display: 'grid',
    width: '100%',
    height: '100%',
  },
  resizer: {
    minWidth: 5,
    minHeight: 5,
    boxSizing: 'border-box',
    background: theme.palette.divider,
    opacity: 0.5,
    zIndex: 1,
    backgroundClip: 'padding-box',
    cursor: 'ns-resize',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

export const App = () => {
  const { classes } = useStyles()
  const theme = useTheme()
  const [splitPaneSize, setSplitPaneSize] = useState<'default' | number>('default')
  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <Typography>{`Patient Journey – v${import.meta.env.VITE_APP_VERSION}`}</Typography>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <SplitPane
          split={'horizontal'}
          resizerClassName={classes.resizer}
          size={splitPaneSize === 'default' ? DEFAULT_SPLIT_PANE_SIZE : splitPaneSize}
          onChange={setSplitPaneSize}
          pane2Style={{
            display: 'grid',
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div className={classes.top}>
            <Data />
          </div>
          <div>
            <Timeline />
          </div>
        </SplitPane>
      </div>
    </>
  )
}
