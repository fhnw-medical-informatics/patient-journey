import React, { useState } from 'react'

import { useTheme } from '@mui/material'
import { makeStyles } from '../../utils'
import SplitPane from 'react-split-pane'
import { DataFilters } from '../containers/filter/DataFilters'
import { Timeline } from '../../timeline/containers/Timeline'
import { DataTable } from '../../table/containers/DataTable'

const DEFAULT_SPLIT_PANE_VERTICAL_SIZE = '15%'
const DEFAULT_SPLIT_PANE_HORIZONTAL_SIZE = '60%'

const useStyles = makeStyles()((theme) => ({
  left: {
    padding: theme.spacing(1),
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  top: {
    padding: theme.spacing(1),
    width: '100%',
    height: '100%',
  },
  bottom: {
    padding: theme.spacing(1),
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

export const DataView = () => {
  const { classes } = useStyles()
  const theme = useTheme()
  const [splitPaneHorizontalSize, setSplitPaneHorizontalSize] = useState<'default' | number>('default')
  const [splitPaneVerticalSize, setSplitPaneVerticalSize] = useState<'default' | number>('default')

  return (
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
          <DataTable />
        </div>
        <div className={classes.bottom}>
          <Timeline />
        </div>
      </SplitPane>
    </SplitPane>
  )
}
