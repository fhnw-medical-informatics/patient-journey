import { useEffect } from 'react'

import { least } from 'd3-array'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EntityId } from '../../data/entities'
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

// TODO: This doesn't have to be a custom layer. Redux mittleware?
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
  useEffect(() => {
    if (cursorPosition !== CursorPositionNone) {
      const cursorPositionMillisX = xScale.invert(cursorPosition.x)

      const nearestLane =
        laneDisplayMode === 'expanded'
          ? least(lanes, (lane) => diff(yScale(lane.laneId) ?? height / 2, cursorPosition.y))
          : null

      // NOTE: We could use d3.bisect with sorted events here, if this is a performance issue in the future.
      const nearestPoint = getNearestPoint(
        laneDisplayMode === 'expanded' && nearestLane !== null
          ? events.filter((event) => event.laneId === nearestLane?.laneId)
          : events,
        cursorPositionMillisX
      )

      if (nearestPoint) {
        onHover(nearestPoint.eventId as EntityId)
      }
    }
  }, [cursorPosition, events, laneDisplayMode, lanes, onHover, yScale, height, xScale])

  return null
}
