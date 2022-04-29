import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode, TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { CursorPosition, TimelineColumn } from '../timelineSlice'
import { PatientDataColumn, PatientId } from '../../data/patients'
import { ControlPanel } from './ControlPanel'
import { EventDataColumn } from '../../data/events'
import { ColorByColumnOption } from '../../color/colorSlice'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateRows: 'auto 1fr',
    paddingBottom: theme.spacing(2),
  },
}))

interface TimelineProps {
  events: ReadonlyArray<TimelineEvent<PatientId, any>>
  lanes: ReadonlyArray<TimelineLane<any>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  viewByColumn: TimelineColumn
  onSetViewByColumn: (column: TimelineColumn) => void
  expandByColumn: TimelineColumn
  onSetExpandByColumn: (column: TimelineColumn) => void
  cluster: boolean
  onSetTimelineCluster: () => void
  showFilteredOut: boolean
  onSetShowFilteredOut: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  colorByColumn: ColorByColumnOption
  onChangeColorByColumn: (column: ColorByColumnOption) => void
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
}

export const Timeline = ({
  events,
  lanes,
  dateFormat,
  laneDisplayMode,
  viewByColumn,
  onSetViewByColumn,
  expandByColumn,
  onSetExpandByColumn,
  cluster,
  onSetTimelineCluster,
  showFilteredOut,
  onSetShowFilteredOut,
  availableColumns,
  colorByColumn,
  onChangeColorByColumn,
  onCursorPositionChange,
}: TimelineProps) => {
  const { classes } = useStyles()

  return (
    <Paper className={classes.root}>
      <ControlPanel
        viewByColumn={viewByColumn}
        onSetViewByColumn={onSetViewByColumn}
        expandByColumn={expandByColumn}
        onSetExpandByColumn={onSetExpandByColumn}
        cluster={cluster}
        onSetTimelineCluster={onSetTimelineCluster}
        showFilteredOut={showFilteredOut}
        onSetShowFilteredOut={onSetShowFilteredOut}
        availableColumns={availableColumns}
        colorByColumn={colorByColumn}
        onChangeColorByColumn={onChangeColorByColumn}
      />
      <TimelineView
        events={events}
        lanes={lanes}
        dateFormat={dateFormat}
        laneDisplayMode={laneDisplayMode}
        enableClustering={cluster}
        onCursorPositionChange={onCursorPositionChange}
      />
    </Paper>
  )
}
