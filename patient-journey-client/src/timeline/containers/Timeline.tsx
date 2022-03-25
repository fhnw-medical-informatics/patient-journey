import React, { useCallback } from 'react'

import { Timeline as TimelineComponent } from '../components/Timeline'
import { useAppDispatch } from '../../store'
import {
  setTimelineCluster,
  setExpandByColumn,
  setViewByColumn,
  TimelineColumn,
  TimelineColumnNone,
} from '../timelineSlice'
import { useActiveDataColumns } from '../../data/hooks'
import { useEntityInteraction } from '../../data'
import { formatMillis } from '../../data/columns'
import { useActiveDataAsEvents, useActiveDataAsLanes, useTimelineState } from '../hooks'
import { ColorByColumnOption, setColorByColumn, useColor, useColorByColumn } from '../../color'
import { useTheme } from '@mui/material'

export const Timeline = () => {
  const theme = useTheme()
  const [colorByColumnFn, colorByCategoryFn] = useColor()
  const events = useActiveDataAsEvents(colorByColumnFn, theme.entityColors.selected)
  const lanes = useActiveDataAsLanes(colorByCategoryFn)
  const { cluster, viewByColumn, expandByColumn } = useTimelineState()
  const activeColumns = useActiveDataColumns()
  const { onEntityClick, onEntityHover } = useEntityInteraction()
  const colorByColumn = useColorByColumn()

  const dispatch = useAppDispatch()

  const onSetViewByColumn = useCallback((column: TimelineColumn) => dispatch(setViewByColumn(column)), [dispatch])
  const onSetExpandByColumn = useCallback((column: TimelineColumn) => dispatch(setExpandByColumn(column)), [dispatch])

  const onSetTimelineCluster = () => dispatch(setTimelineCluster())

  const onChangeColorByColumn = useCallback(
    (column: ColorByColumnOption) => dispatch(setColorByColumn({ colorByColumn: column })),
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
      onEventHover={onEntityHover}
      onEventSelect={onEntityClick}
    />
  )
}
