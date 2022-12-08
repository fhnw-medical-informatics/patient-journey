import React, { useCallback } from 'react'

import { throttle } from 'lodash'

import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import {
  CursorPosition,
  setCursorPosition,
  setExpandByColumn,
  setShowFilteredOut,
  setSortByColumn,
  setTimelineCluster,
  setViewByColumn,
  TimelineColumn,
  TimelineColumnNone,
  toggleAllowInteraction,
  toggleTimeGrid,
} from '../timelineSlice'
import { useEntityInteraction, useEventDataColumns, useEventFilters, usePatientDataColumns } from '../../data/hooks'
import { formatMillis } from '../../data/columns'
import {
  useActiveDataAsEvents,
  useActiveDataAsLanes,
  useTimelineCluster,
  useViewByColumn,
  useExpandByColumn,
  useShowFilteredOut,
  useShowTimeGrid,
  useAllowInteraction,
  useSortByColumn,
  useTimelineDataColumns,
  useTimelineSortDataColumns,
} from '../hooks'
import { ColorByColumn, setColorByColumn } from '../../color/colorSlice'
import { useColor } from '../../color/hooks'
import { useTheme } from '@mui/material'
import { EntityIdNone } from '../../data/entities'

export const Timeline = React.memo(() => {
  const theme = useTheme()

  const { colorByColumnFn: eventsColorByColumnFn } = useColor('events')
  const { colorByColumnFn: patientsColorByColumnFn, colorByCategoryFn, colorByColumn } = useColor('patients')

  const showFilteredOut = useShowFilteredOut()
  const events = useActiveDataAsEvents(eventsColorByColumnFn, theme.entityColors.filteredOut)
  const lanes = useActiveDataAsLanes(patientsColorByColumnFn, colorByCategoryFn, colorByColumn)
  const cluster = useTimelineCluster()
  const showTimeGrid = useShowTimeGrid()
  const allowInteraction = useAllowInteraction()
  const viewByColumn = useViewByColumn()
  const expandByColumn = useExpandByColumn()
  const sortByColumn = useSortByColumn()
  const activeColumns = useTimelineDataColumns()
  const sortColumns = useTimelineSortDataColumns()
  const eventDataColumns = useEventDataColumns()
  const patientDataColumns = usePatientDataColumns()
  const eventFilters = useEventFilters()

  const dispatch = useAppDispatch()

  const onSetViewByColumn = useCallback((column: TimelineColumn) => dispatch(setViewByColumn(column)), [dispatch])
  const onSetExpandByColumn = useCallback((column: TimelineColumn) => dispatch(setExpandByColumn(column)), [dispatch])
  const onSetSortByColumn = useCallback((column: TimelineColumn) => dispatch(setSortByColumn(column)), [dispatch])

  const onSetTimelineCluster = useCallback(() => dispatch(setTimelineCluster()), [dispatch])
  const onSetShowFilteredOut = useCallback(() => dispatch(setShowFilteredOut()), [dispatch])
  const onToggleTimeGrid = useCallback(() => dispatch(toggleTimeGrid()), [dispatch])
  const onToggleAllowInteraction = useCallback(() => dispatch(toggleAllowInteraction()), [dispatch])

  const onChangeColorByColumn = useCallback(
    (colorByColumn: ColorByColumn) => dispatch(setColorByColumn(colorByColumn)),
    [dispatch]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledDispatch = useCallback(
    throttle((arg: any) => dispatch(arg), 16, { trailing: false }),
    [dispatch]
  )

  const onCursorPositionChange = useCallback(
    (cursorPosition: CursorPosition) => {
      throttledDispatch(setCursorPosition(cursorPosition))
    },
    [throttledDispatch]
  )

  const { onEntityHover } = useEntityInteraction('events')
  const onInteractionEnd = useCallback(() => onEntityHover(EntityIdNone), [onEntityHover])

  return (
    <TimelineComponent
      dateFormat={formatMillis}
      laneDisplayMode={expandByColumn === TimelineColumnNone ? 'collapsed' : 'expanded'}
      events={events}
      lanes={lanes}
      availableColumns={activeColumns}
      eventDataColumns={eventDataColumns}
      patientDataColumns={patientDataColumns}
      viewByColumn={viewByColumn}
      onSetViewByColumn={onSetViewByColumn}
      expandByColumn={expandByColumn}
      onSetExpandByColumn={onSetExpandByColumn}
      sortByColumn={sortByColumn}
      onSetSortByColumn={onSetSortByColumn}
      availableSortColumns={sortColumns}
      cluster={cluster}
      onSetTimelineCluster={onSetTimelineCluster}
      showFilteredOut={showFilteredOut}
      onSetShowFilteredOut={onSetShowFilteredOut}
      colorByColumn={colorByColumn}
      onChangeColorByColumn={onChangeColorByColumn}
      onCursorPositionChange={onCursorPositionChange}
      showTimeGrid={showTimeGrid}
      onToggleTimeGrid={onToggleTimeGrid}
      allowInteraction={allowInteraction}
      onToggleAllowInteraction={onToggleAllowInteraction}
      onInteractionEnd={onInteractionEnd}
      hasActiveEventFilters={eventFilters.length > 0}
    />
  )
})
