import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode, TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { TimelineState, TimelineColumn } from '../timelineSlice'
import { PatientDataColumn, PatientId } from '../../data/patients'
import { ControlPanel } from './ControlPanel'
import { EventDataColumn } from '../../data/events'

const useStyles = makeStyles()({
  root: {
    width: '100%',
    height: '100%',
  },
})

interface TimelineProps {
  events: ReadonlyArray<TimelineEvent<PatientId, PatientId>>
  lanes: ReadonlyArray<TimelineLane<PatientId>>
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  onSetTimelineColumn: (column: TimelineColumn) => void
  onSetTimelineCluster: () => void
  onSetTimelineGrouping: () => void
  timelineState: TimelineState
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
}

export const Timeline = ({
  events,
  lanes,
  dateFormat,
  laneDisplayMode,
  onSetTimelineColumn,
  onSetTimelineCluster,
  onSetTimelineGrouping,
  timelineState,
  availableColumns,
}: TimelineProps) => {
  const { classes } = useStyles()

  return (
    <Paper className={classes.root}>
      <ControlPanel
        onSetTimelineColumn={onSetTimelineColumn}
        onSetTimelineCluster={onSetTimelineCluster}
        onSetTimelineGrouping={onSetTimelineGrouping}
        timelineState={timelineState}
        availableColumns={availableColumns}
        numberOfEvents={events.length}
      />
      <TimelineView
        events={events}
        lanes={lanes}
        dateFormat={dateFormat}
        laneDisplayMode={laneDisplayMode}
        enableClustering={timelineState.cluster}
      />
    </Paper>
  )
}
