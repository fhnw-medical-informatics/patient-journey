import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { Typography, useTheme } from '@mui/material'
import { makeStyles } from '../../utils'
import { Data, DataViewSelector } from '../../data'
import SplitPane from 'react-split-pane'
import { DataFilters } from '../../data/containers/filter/DataFilters'
import { Timeline } from '../../timeline'
import logo from './fhnw-logo.png'

const DEFAULT_SPLIT_PANE_VERTICAL_SIZE = '15%'
const DEFAULT_SPLIT_PANE_HORIZONTAL_SIZE = '60%'

const useStyles = makeStyles()((theme) => ({
  app: {
    height: `100vh`,
    width: '100vw',
    display: 'grid',
    gridTemplateRows: `64px 1fr`,
  },
  appBar: {
    position: 'relative', // override MUI fixed
  },
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    justifyItems: 'start',
  },
  logo: {
    height: 40,
    justifySelf: 'start',
    paddingRight: theme.spacing(2),
  },
  title: {
    // centered on page (rather than in flow of toolbar items)
    position: 'absolute',
    width: '100%',
    display: 'grid',
    justifyItems: 'center',
    pointerEvents: 'none',
  },
  main: {
    display: 'grid',
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  left: {
    padding: theme.spacing(1),
    display: 'grid',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  top: {
    padding: theme.spacing(1),
    display: 'grid',
    width: '100%',
    height: '100%',
  },
  bottom: {
    padding: theme.spacing(1),
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
  },
}))

export const App = () => {
  const { classes } = useStyles()
  const theme = useTheme()
  const [splitPaneHorizontalSize, setSplitPaneHorizontalSize] = useState<'default' | number>('default')
  const [splitPaneVerticalSize, setSplitPaneVerticalSize] = useState<'default' | number>('default')

  return (
    <div className={classes.app}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <img className={classes.logo} src={logo} alt={'Fachhochschule Nordwestschweiz'} />
          <DataViewSelector />
          <Typography className={classes.title}>{`Patient Journey – v${import.meta.env.VITE_APP_VERSION}`}</Typography>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <SplitPane
          split={'vertical'}
          resizerClassName={classes.resizer}
          size={splitPaneHorizontalSize === 'default' ? DEFAULT_SPLIT_PANE_VERTICAL_SIZE : splitPaneVerticalSize}
          onChange={setSplitPaneVerticalSize}
          resizerStyle={{
            cursor: 'ew-resize',
          }}
        >
          <div className={classes.left}>
            <DataFilters />
          </div>
          <SplitPane
            split={'horizontal'}
            resizerClassName={classes.resizer}
            size={splitPaneHorizontalSize === 'default' ? DEFAULT_SPLIT_PANE_HORIZONTAL_SIZE : splitPaneHorizontalSize}
            onChange={setSplitPaneHorizontalSize}
            resizerStyle={{
              cursor: 'ns-resize',
            }}
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
            <div className={classes.bottom}>
              <Timeline />
            </div>
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  )
}
