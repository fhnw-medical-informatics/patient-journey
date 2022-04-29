import React, { useCallback } from 'react'

import { throttle } from 'lodash'

import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import {
  CursorPosition,
  setCursorPosition,
  setExpandByColumn,
  setShowFilteredOut,
  setTimelineCluster,
  setViewByColumn,
  TimelineColumn,
  TimelineColumnNone,
  toggleTimeGrid,
} from '../timelineSlice'
import { useTimelineDataColumns } from '../../data/hooks'
import { formatMillis } from '../../data/columns'
import {
  useActiveDataAsEvents,
  useActiveDataAsLanes,
  useTimelineCluster,
  useViewByColumn,
  useExpandByColumn,
  useShowFilteredOut,
  useShowTimeGrid,
} from '../hooks'
import { ColorByColumnOption, setColorByColumn } from '../../color/colorSlice'
import { useColor } from '../../color/hooks'
import { useColorByColumn } from '../../color/hooks'

export const Timeline = React.memo(() => {
  const { colorByColumnFn, colorByCategoryFn } = useColor()
  const events = useActiveDataAsEvents(colorByColumnFn)
  const lanes = useActiveDataAsLanes(colorByCategoryFn)
  const cluster = useTimelineCluster()
  const showFilteredOut = useShowFilteredOut()
  const showTimeGrid = useShowTimeGrid()
  const viewByColumn = useViewByColumn()
  const expandByColumn = useExpandByColumn()
  const activeColumns = useTimelineDataColumns()
  const colorByColumn = useColorByColumn()

  const dispatch = useAppDispatch()

  const onSetViewByColumn = useCallback((column: TimelineColumn) => dispatch(setViewByColumn(column)), [dispatch])
  const onSetExpandByColumn = useCallback((column: TimelineColumn) => dispatch(setExpandByColumn(column)), [dispatch])

  const onSetTimelineCluster = useCallback(() => dispatch(setTimelineCluster()), [dispatch])
  const onSetShowFilteredOut = useCallback(() => dispatch(setShowFilteredOut()), [dispatch])
  const onToggleTimeGrid = useCallback(() => dispatch(toggleTimeGrid()), [dispatch])

  const onChangeColorByColumn = useCallback(
    (column: ColorByColumnOption) => dispatch(setColorByColumn({ colorByColumn: column })),
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
      cluster={cluster}
      onSetTimelineCluster={onSetTimelineCluster}
      showFilteredOut={showFilteredOut}
      onSetShowFilteredOut={onSetShowFilteredOut}
      colorByColumn={colorByColumn}
      onChangeColorByColumn={onChangeColorByColumn}
      onCursorPositionChange={onCursorPositionChange}
      showTimeGrid={showTimeGrid}
      onToggleTimeGrid={onToggleTimeGrid}
    />
  )
})
