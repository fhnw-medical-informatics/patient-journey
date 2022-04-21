import React from 'react'

import { useTheme } from '@mui/material'
import { least } from 'd3-array'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EntityId, EntityIdNone } from '../../data/entities'
import { diff } from '../../utils'

import { CursorPosition, CursorPositionNone } from '../timelineSlice'

const getNearestPoint = <EID extends string, LID extends string>(
  events: ReadonlyArray<TimelineEvent<EID, LID>>,
  cursorPosition: number
): TimelineEvent<EID, LID> | null => {
  return least(events, (event) => diff(event.startTimeMillis, cursorPosition)) ?? null
}

interface TimelineCanvasMarksInteractionProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {
  cursorPosition: CursorPosition
  onHover: (eventId: EntityId) => void
  onSelect: (eventId: EntityId) => void
}

export const TimelineCanvasMarksInteraction = <
  EID extends string,
  LID extends string,
  E extends TimelineEvent<EID, LID>
>({
  events,
  cursorPosition,
  lanes,
  yScale,
  xScale,
  laneDisplayMode,
  height,
  onHover,
  onSelect,
}: TimelineCanvasMarksInteractionProps<EID, LID, E>) => {
  const theme = useTheme()

  // TODO: Performance (throttling and faster point/lane lookup with sorted events)
  // TODO: Hover and selection --> Hover the nearest automatically (not the one under the cursor)

  if (cursorPosition !== CursorPositionNone) {
    const cursorPositionMillisX = xScale.invert(cursorPosition.x)

    const nearestLane =
      laneDisplayMode === 'expanded'
        ? least(lanes, (lane) => diff(yScale(lane.laneId) ?? height / 2, cursorPosition.y))
        : null

    const nearestPoint = getNearestPoint(
      laneDisplayMode === 'expanded' && nearestLane !== null
        ? events.filter((event) => event.laneId === nearestLane?.laneId)
        : events,
      cursorPositionMillisX
    )

    if (nearestPoint) {
      const x = Math.round(xScale(nearestPoint.startTimeMillis))
      const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(nearestPoint.laneId) ?? height / 2)

      return (
        <circle
          cx={x}
          cy={y}
          r={10}
          fill={nearestPoint.color}
          stroke={theme.palette.text.primary}
          strokeWidth={2}
          onClick={() => onSelect(nearestPoint.eventId as EntityId)}
          onMouseEnter={() => onHover(nearestPoint.eventId as EntityId)}
          onMouseLeave={() => onHover(EntityIdNone)}
        ></circle>
      )
    }
  }

  return null
}
