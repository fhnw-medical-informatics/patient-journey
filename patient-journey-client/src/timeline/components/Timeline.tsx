import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode, TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { CursorPosition, TimelineColumn } from '../timelineSlice'
import { PatientDataColumn, PatientId } from '../../data/patients'
import { ControlPanel } from './ControlPanel'
import { EventDataColumn } from '../../data/events'
import { ColorByColumn } from '../../color/colorSlice'

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
  showTimeGrid: boolean
  onToggleTimeGrid: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  eventDataColumns: ReadonlyArray<EventDataColumn>
  patientDataColumns: ReadonlyArray<PatientDataColumn>
  colorByColumn: ColorByColumn
  onChangeColorByColumn: (colorByColumn: ColorByColumn) => void
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
  onInteractionEnd: () => void
  hasActiveEventFilters: boolean
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
  showTimeGrid,
  onToggleTimeGrid,
  availableColumns,
  eventDataColumns,
  patientDataColumns,
  colorByColumn,
  onChangeColorByColumn,
  onCursorPositionChange,
  onInteractionEnd,
  hasActiveEventFilters,
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
        showTimeGrid={showTimeGrid}
        onToggleTimeGrid={onToggleTimeGrid}
        onSetTimelineCluster={onSetTimelineCluster}
        showFilteredOut={showFilteredOut}
        onSetShowFilteredOut={onSetShowFilteredOut}
        availableColumns={availableColumns}
        eventDataColumns={eventDataColumns}
        patientDataColumns={patientDataColumns}
        colorByColumn={colorByColumn}
        onChangeColorByColumn={onChangeColorByColumn}
        hasActiveFilters={hasActiveEventFilters}
      />
      <TimelineView
        events={events}
        lanes={lanes}
        dateFormat={dateFormat}
        laneDisplayMode={laneDisplayMode}
        enableClustering={cluster}
        showTimeGrid={showTimeGrid}
        onCursorPositionChange={onCursorPositionChange}
        onInteractionEnd={onInteractionEnd}
      />
    </Paper>
  )
}
