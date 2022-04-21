import React, { useCallback } from 'react'

import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import {
  CursorPosition,
  setCursorPosition,
  setExpandByColumn,
  setTimelineCluster,
  setViewByColumn,
  TimelineColumn,
  TimelineColumnNone,
} from '../timelineSlice'
import { useActiveDataColumns } from '../../data/hooks'
import { formatMillis } from '../../data/columns'
import { useActiveDataAsEvents, useActiveDataAsLanes, useTimelineState } from '../hooks'
import { ColorByColumnOption, setColorByColumn } from '../../color/colorSlice'
import { useColor } from '../../color/useColor'
import { useColorByColumn } from '../../color/useColorByColumn'

export const Timeline = () => {
  const [colorByColumnFn, colorByCategoryFn] = useColor()
  const events = useActiveDataAsEvents(colorByColumnFn)
  const lanes = useActiveDataAsLanes(colorByCategoryFn)
  const { cluster, viewByColumn, expandByColumn } = useTimelineState()
  const activeColumns = useActiveDataColumns()
  const colorByColumn = useColorByColumn()

  const dispatch = useAppDispatch()

  const onSetViewByColumn = useCallback((column: TimelineColumn) => dispatch(setViewByColumn(column)), [dispatch])
  const onSetExpandByColumn = useCallback((column: TimelineColumn) => dispatch(setExpandByColumn(column)), [dispatch])

  const onSetTimelineCluster = () => dispatch(setTimelineCluster())

  const onChangeColorByColumn = useCallback(
    (column: ColorByColumnOption) => dispatch(setColorByColumn({ colorByColumn: column })),
    [dispatch]
  )

  const onCursorPositionChange = useCallback(
    (cursorPosition: CursorPosition) => {
      dispatch(setCursorPosition(cursorPosition))
    },
    [dispatch]
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
      colorByColumn={colorByColumn}
      onChangeColorByColumn={onChangeColorByColumn}
      onCursorPositionChange={onCursorPositionChange}
    />
  )
}
