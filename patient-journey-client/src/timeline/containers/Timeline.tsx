import React, { useCallback } from 'react'

import { throttle } from 'lodash'

import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import {
  CursorPosition,
  setCursorPosition,
  setExpandByColumn,
  setShowFilteredOut,
  setSortByState,
  setTimelineCluster,
  setViewByColumn,
  TimelineColumn,
  TimelineColumnNone,
  toggleAllowInteraction,
  toggleTimeGrid,
} from '../timelineSlice'
import { useEntityInteraction, useEventFilters } from '../../data/hooks'
import { formatMillis } from '../../data/columns'
import {
  useActiveDataAsEvents,
  useActiveDataAsLanes,
  useAllowInteraction,
  useExpandByColumn,
  useHoveredLaneId,
  useShowFilteredOut,
  useShowTimeGrid,
  useSortByState,
  useTimelineCluster,
  useTimelineDataColumns,
  useTimelineSortDataColumns,
  useViewByColumn,
} from '../hooks'
import { useColor } from '../../color/hooks'
import { useTheme } from '@mui/material'
import { EntityIdNone } from '../../data/entities'
import { ColumnSortingState } from '../../data/sorting'

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
  const sortByState = useSortByState()
  const activeColumns = useTimelineDataColumns()
  const sortColumns = useTimelineSortDataColumns()
  const eventFilters = useEventFilters()

  const dispatch = useAppDispatch()

  const onSetViewByColumn = useCallback((column: TimelineColumn) => dispatch(setViewByColumn(column)), [dispatch])
  const onSetExpandByColumn = useCallback((column: TimelineColumn) => dispatch(setExpandByColumn(column)), [dispatch])
  const onSetSortByState = useCallback(
    (sortState: ColumnSortingState) => dispatch(setSortByState(sortState)),
    [dispatch]
  )

  const onSetTimelineCluster = useCallback(() => dispatch(setTimelineCluster()), [dispatch])
  const onSetShowFilteredOut = useCallback(() => dispatch(setShowFilteredOut()), [dispatch])
  const onToggleTimeGrid = useCallback(() => dispatch(toggleTimeGrid()), [dispatch])
  const onToggleAllowInteraction = useCallback(() => dispatch(toggleAllowInteraction()), [dispatch])

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

  const { onEntityClick: onPatientsEntityClick } = useEntityInteraction('patients')
  const hoveredLaneId = useHoveredLaneId()

  const handleTimelineClick = useCallback(() => {
    if (expandByColumn !== TimelineColumnNone && expandByColumn.type === 'pid') {
      onPatientsEntityClick(hoveredLaneId)
    }
  }, [onPatientsEntityClick, expandByColumn, hoveredLaneId])

  return (
    <TimelineComponent
      dateFormat={formatMillis}
      laneDisplayMode={expandByColumn === TimelineColumnNone ? 'collapsed' : 'expanded'}
      events={events}
      lanes={lanes}
      availableColumns={activeColumns}
      viewByColumn={viewByColumn}
      onSetViewByColumn={onSetViewByColumn}
      expandByColumn={expandByColumn}
      onSetExpandByColumn={onSetExpandByColumn}
      sortByState={sortByState}
      onSetSortByState={onSetSortByState}
      availableSortColumns={sortColumns}
      cluster={cluster}
      onSetTimelineCluster={onSetTimelineCluster}
      showFilteredOut={showFilteredOut}
      onSetShowFilteredOut={onSetShowFilteredOut}
      onCursorPositionChange={onCursorPositionChange}
      showTimeGrid={showTimeGrid}
      onToggleTimeGrid={onToggleTimeGrid}
      allowInteraction={allowInteraction}
      onToggleAllowInteraction={onToggleAllowInteraction}
      onInteractionEnd={onInteractionEnd}
      hasActiveEventFilters={eventFilters.length > 0}
      onTimelineClick={handleTimelineClick}
    />
  )
})
