import React from 'react'
import { DataState } from '../../data/dataSlice'
import { makeStyles } from '../../utils'
import { LaneDisplayMode } from 'react-svg-timeline'
import { Paper, Typography } from '@mui/material'
import { ControlPanel } from './ControlPanel'
import { LoadingProgress } from '../../data/components/LoadingProgress'
import { LoadingError } from '../../data/components/LoadingError'
import { TimelineView } from './TimelineView'
import { TimelineType, TimelineState } from '../timelineSlice'

const useStyles = makeStyles()({
  root: {
    width: '100%',
    height: '100%',
  },
})

interface TimelineProps {
  readonly data: DataState
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
  onSetTimelineType: (type: TimelineType) => void
  onSetTimelineCluster: () => void
  readonly timelineState: TimelineState
}

export const Timeline = ({
  data,
  dateFormat,
  laneDisplayMode,
  onSetTimelineType,
  onSetTimelineCluster,
  timelineState,
}: TimelineProps) => {
  const { classes } = useStyles()

  switch (data.type) {
    case 'loading-pending':
      return <Typography>No Data</Typography>
    case 'loading-in-progress':
      return <LoadingProgress />
    case 'loading-failed':
      return <LoadingError errorMessage={data.errorMessage} />
    case 'loading-complete': {
      return (
        <Paper className={classes.root}>
          <ControlPanel onSetTimelineType={onSetTimelineType} onSetTimelineCluster={onSetTimelineCluster} />
          <TimelineView
            data={data.patientData}
            dateFormat={dateFormat}
            laneDisplayMode={laneDisplayMode}
            timelineState={timelineState}
          />
        </Paper>
      )
    }
  }
}
