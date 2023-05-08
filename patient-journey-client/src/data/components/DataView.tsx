import React, { useState } from 'react'

import { makeStyles } from '../../utils'
import SplitPane from 'react-split-pane'
import { DataFilters } from '../containers/filter/DataFilters'
import { DataTable } from '../../table/containers/DataTable'
import { InfoPanel } from '../../info/containers/InfoPanel'
import { ScatterPlot } from '../../plot/containers/ScatterPlot'
import { Timeline } from '../../timeline/containers/Timeline'
import { Fab } from '@mui/material'
import InsertChartIcon from '@mui/icons-material/InsertChart'

const DIVIDER_SIZE = 12

const DEFAULT_SPLIT_PANE_VERTICAL_SIZE = '20%'
const DEFAULT_SPLIT_PANE_RIGHT_HORIZONTAL_SIZE = '60%'
const DEFAULT_SPLIT_PANE_LEFT_HORIZONTAL_SIZE = '65%'
const DEFAULT_SPLIT_PANE_PLOTS_VERTICAL_SIZE = '20%'

const useStyles = makeStyles()((theme) => ({
  panel: {
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
  filters: {
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  scatterPlotButton: {
    position: 'absolute',
    zIndex: 2,
    right: 20,
    bottom: 20,
  },
}))

interface DataViewProps {
  onResizeStart: () => void
  onResizeEnd: () => void
}

export const DataView = ({ onResizeStart, onResizeEnd }: DataViewProps) => {
  const { classes, cx } = useStyles()

  const [splitPaneVerticalSize, setSplitPaneVerticalSize] = useState<'default' | number>('default')
  const [splitPaneRightHorizontalSize, setSplitPaneRightHorizontalSize] = useState<'default' | number>('default')
  const [splitPaneLeftHorizontalSize, setSplitPaneLeftHorizontalSize] = useState<'default' | number>('default')
  const [splitPanePlotsVerticalSize, setSplitPanePlotsVerticalSize] = useState<'collapsed' | 'default' | number>(
    'collapsed'
  )

  return (
    // https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-typescript-definitions
    // @ts-ignore
    <SplitPane
      split={'vertical'}
      resizerClassName={classes.resizer}
      size={splitPaneVerticalSize === 'default' ? DEFAULT_SPLIT_PANE_VERTICAL_SIZE : splitPaneVerticalSize}
      onChange={setSplitPaneVerticalSize}
      resizerStyle={{
        cursor: 'ew-resize',
      }}
      maxSize={-DIVIDER_SIZE}
      minSize={DIVIDER_SIZE}
      onDragStarted={onResizeStart}
      onDragFinished={onResizeEnd}
    >
      {/* @ts-ignore */}
      <SplitPane
        split={'horizontal'}
        resizerClassName={classes.resizer}
        size={
          splitPaneLeftHorizontalSize === 'default'
            ? DEFAULT_SPLIT_PANE_LEFT_HORIZONTAL_SIZE
            : splitPaneLeftHorizontalSize
        }
        onChange={setSplitPaneLeftHorizontalSize}
        resizerStyle={{
          cursor: 'ns-resize',
        }}
        minSize={DIVIDER_SIZE}
        maxSize={-DIVIDER_SIZE}
        onDragStarted={onResizeStart}
        onDragFinished={onResizeEnd}
      >
        <div className={cx(classes.panel, classes.filters)}>
          <DataFilters />
        </div>
        <div className={classes.panel}>
          <InfoPanel />
        </div>
      </SplitPane>
      {/* @ts-ignore */}
      <SplitPane
        split={'horizontal'}
        resizerClassName={classes.resizer}
        size={
          splitPaneRightHorizontalSize === 'default'
            ? DEFAULT_SPLIT_PANE_RIGHT_HORIZONTAL_SIZE
            : splitPaneRightHorizontalSize
        }
        onChange={setSplitPaneRightHorizontalSize}
        resizerStyle={{
          cursor: 'ns-resize',
        }}
        pane2Style={{
          display: 'grid',
          width: '100%',
          height: '100%',
        }}
        minSize={144}
        maxSize={-DIVIDER_SIZE}
        onDragStarted={onResizeStart}
        onDragFinished={onResizeEnd}
      >
        <div className={classes.panel}>
          <DataTable />
        </div>
        {/* @ts-ignore */}
        <SplitPane
          primary={'second'} // control scatter plot portion of split pane
          split={'vertical'}
          resizerClassName={classes.resizer}
          size={
            splitPanePlotsVerticalSize === 'collapsed'
              ? 0
              : 'default'
              ? DEFAULT_SPLIT_PANE_PLOTS_VERTICAL_SIZE
              : splitPanePlotsVerticalSize
          }
          onChange={setSplitPanePlotsVerticalSize}
          resizerStyle={{
            cursor: 'ew-resize',
          }}
          pane1Style={{
            display: 'grid',
            width: '100%',
            height: '100%',
          }}
          minSize={-DIVIDER_SIZE}
          onDragStarted={onResizeStart}
          onDragFinished={onResizeEnd}
        >
          <div className={classes.panel}>
            <Timeline />
            {(splitPanePlotsVerticalSize === 'collapsed' || splitPanePlotsVerticalSize < 2 * DIVIDER_SIZE) && (
              <Fab
                className={classes.scatterPlotButton}
                size={'small'}
                onClick={() => setSplitPanePlotsVerticalSize('default')}
              >
                <InsertChartIcon />
              </Fab>
            )}
          </div>
          <div className={classes.panel}>
            <ScatterPlot />
          </div>
        </SplitPane>
      </SplitPane>
    </SplitPane>
  )
}
