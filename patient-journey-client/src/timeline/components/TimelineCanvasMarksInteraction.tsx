import { useTheme } from '@mui/material'
import { least } from 'd3-array'
import React from 'react'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
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
}: TimelineCanvasMarksInteractionProps<EID, LID, E>) => {
  const theme = useTheme()

  // TODO: Performance (throttling and faster point/lane lookup with sorted events)
  // TODO: Adjust selectors so that acive events and hovered/selected are decoupled and hovered/selected are always on top,
  // this way we can sort the events in the selector because it doesn't recalc when hovered/selected changes
  // TODO: Hover and selection

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
          //   onClick={onClick}
          //   onMouseEnter={onMouseEnter}
          //   onMouseLeave={onMouseLeave}
        ></circle>
      )
    }
  }

  return null
}
