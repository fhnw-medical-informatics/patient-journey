import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { TimelineState, TimelineColumn } from '../timelineSlice'
import { PatientData } from '../../data/patients'
import { EventData } from '../../data/events'

const useStyles = makeStyles()({
  root: {
    width: '100%',
    height: '100%',
  },
})

interface TimelineProps {
  readonly data: PatientData | EventData
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  onSetTimelineColumn: (column: TimelineColumn) => void
  onSetTimelineCluster: () => void
  onSetTimelineGrouping: () => void
  readonly timelineState: TimelineState
  availableColumns: ReadonlyArray<TimelineColumn>
}

export const Timeline = ({
  data,
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
      {/* <ControlPanel
            onSetTimelineColumn={onSetTimelineColumn}
            onSetTimelineCluster={onSetTimelineCluster}
            onSetTimelineGrouping={onSetTimelineGrouping}
            timelineState={timelineState}
            availableColumns={availableColumns}
          /> */}
      <TimelineView
        data={data}
        dateFormat={dateFormat}
        laneDisplayMode={laneDisplayMode}
        timelineState={timelineState}
        availableColumns={availableColumns}
      />
    </Paper>
  )
}
