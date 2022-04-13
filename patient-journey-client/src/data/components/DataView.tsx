import React, { useState } from 'react'

import { useTheme } from '@mui/material'
import { makeStyles } from '../../utils'
import SplitPane from 'react-split-pane'
import { DataFilters } from '../containers/filter/DataFilters'
import { Timeline } from '../../timeline/containers/Timeline'
import { DataTable } from '../../table/containers/DataTable'
import { DataLegend } from './DataLegend'

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
  right: {
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateRows: '1fr auto',
  },
  rightSplitTop: {
    padding: theme.spacing(1),
    width: '100%',
    height: '100%',
  },
  rightSplitBottom: {
    padding: theme.spacing(1),
    paddingBottom: 0,
    width: '100%',
    height: '100%',
  },
  legend: {
    padding: theme.spacing(1),
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
      <div className={classes.right}>
        <SplitPane
          split={'horizontal'}
          resizerClassName={classes.resizer}
          size={splitPaneHorizontalSize === 'default' ? DEFAULT_SPLIT_PANE_HORIZONTAL_SIZE : splitPaneHorizontalSize}
          onChange={setSplitPaneHorizontalSize}
          style={{
            position: 'static',
          }}
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
          <div className={classes.rightSplitTop}>
            <DataTable />
          </div>
          <div className={classes.rightSplitBottom}>
            <Timeline />
          </div>
        </SplitPane>
        <div className={classes.legend}>
          <DataLegend />
        </div>
      </div>
    </SplitPane>
  )
}
