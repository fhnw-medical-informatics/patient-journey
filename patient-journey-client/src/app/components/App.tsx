import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { Typography, useTheme } from '@mui/material'
import { makeStyles } from '../../utils'
import { Data, DataViewSelector } from '../../data'
import SplitPane from 'react-split-pane'
import { DataFilters } from '../../data/containers/filter/DataFilters'

const DEFAULT_SPLIT_PANE_VERTICAL_SIZE = '15%'
const DEFAULT_SPLIT_PANE_HORIZONTAL_SIZE = '75%'

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'min-content auto auto',
    justifyItems: 'end',
  },
  main: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
  },
  left: {
    paddingTop: 70,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    display: 'grid',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
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
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

export const App = () => {
  const { classes } = useStyles()
  const theme = useTheme()
  const [splitPaneHorizontalSize, setSplitPaneHorizontalSize] = useState<'default' | number>('default')
  const [splitPaneVerticalSize, setSplitPaneVerticalSize] = useState<'default' | number>('default')

  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <DataViewSelector />
          <Typography>{`Patient Journey – v${import.meta.env.VITE_APP_VERSION}`}</Typography>
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
            <div>{/** TODO: Timeline */}</div>
          </SplitPane>
        </SplitPane>
      </div>
    </>
  )
}
