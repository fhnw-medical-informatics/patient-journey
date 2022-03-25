import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode, TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { TimelineColumn } from '../timelineSlice'
import { PatientDataColumn, PatientId } from '../../data/patients'
import { ControlPanel } from './ControlPanel'
import { EventDataColumn } from '../../data/events'
import { EntityId } from '../../data/entities'
import { ColorByColumnOption } from '../../color'

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
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  onEventHover: (eventId: EntityId) => void
  onEventSelect: (eventId: EntityId) => void
  colorByColumn: ColorByColumnOption
  onChangeColorByColumn: (column: ColorByColumnOption) => void
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
  availableColumns,
  onEventHover,
  onEventSelect,
  colorByColumn,
  onChangeColorByColumn,
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
        onHover={onEventHover}
        onSelect={onEventSelect}
      />
    </Paper>
  )
}
