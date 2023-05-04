import React from 'react'
import { makeStyles } from '../../utils'
import { LaneDisplayMode, TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { Paper } from '@mui/material'
import { TimelineView } from './TimelineView'
import { CursorPosition, TimelineColumn } from '../timelineSlice'
import { PatientDataColumn, PatientId } from '../../data/patients'
import { ControlPanel } from './ControlPanel'
import { EventDataColumn } from '../../data/events'
import { ColumnSortingState } from '../../data/sorting'

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
  sortByState: ColumnSortingState
  onSetSortByState: (state: ColumnSortingState) => void
  availableSortColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  cluster: boolean
  onSetTimelineCluster: () => void
  showFilteredOut: boolean
  onSetShowFilteredOut: () => void
  showTimeGrid: boolean
  onToggleTimeGrid: () => void
  allowInteraction: boolean
  onToggleAllowInteraction: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  onCursorPositionChange: (cursorPosition: CursorPosition) => void
  onInteractionEnd: () => void
  hasActiveEventFilters: boolean
  onTimelineClick: () => void
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
  sortByState,
  onSetSortByState,
  availableSortColumns,
  cluster,
  onSetTimelineCluster,
  showFilteredOut,
  onSetShowFilteredOut,
  showTimeGrid,
  onToggleTimeGrid,
  allowInteraction,
  onToggleAllowInteraction,
  availableColumns,
  onCursorPositionChange,
  onInteractionEnd,
  hasActiveEventFilters,
  onTimelineClick,
}: TimelineProps) => {
  const { classes } = useStyles()

  return (
    <Paper variant="outlined" className={classes.root}>
      <ControlPanel
        viewByColumn={viewByColumn}
        onSetViewByColumn={onSetViewByColumn}
        expandByColumn={expandByColumn}
        onSetExpandByColumn={onSetExpandByColumn}
        availableSortColumns={availableSortColumns}
        sortByState={sortByState}
        onSetSortByState={onSetSortByState}
        cluster={cluster}
        showTimeGrid={showTimeGrid}
        onToggleTimeGrid={onToggleTimeGrid}
        allowInteraction={allowInteraction}
        onToggleAllowInteraction={onToggleAllowInteraction}
        onSetTimelineCluster={onSetTimelineCluster}
        showFilteredOut={showFilteredOut}
        onSetShowFilteredOut={onSetShowFilteredOut}
        availableColumns={availableColumns}
        hasActiveFilters={hasActiveEventFilters}
      />
      <TimelineView
        events={events}
        lanes={lanes}
        dateFormat={dateFormat}
        laneDisplayMode={laneDisplayMode}
        enableClustering={cluster}
        showTimeGrid={showTimeGrid}
        allowInteraction={allowInteraction}
        onCursorPositionChange={onCursorPositionChange}
        onInteractionEnd={onInteractionEnd}
        onTimelineClick={onTimelineClick}
      />
    </Paper>
  )
}
