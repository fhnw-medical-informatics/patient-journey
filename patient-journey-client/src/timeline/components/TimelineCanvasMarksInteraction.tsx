import { useEffect } from 'react'

import { least } from 'd3-array'

import { EntityId } from '../../data/entities'
import { diff } from '../../utils'

import { CursorPosition, CursorPositionNone } from '../timelineSlice'
import { EventId } from '../../data/events'
import { PatientJourneyCustomLayerProps, PatientJourneyTimelineEvent } from './shared'

const getNearestPoint = <LID extends string>(
  events: ReadonlyArray<PatientJourneyTimelineEvent<LID>>,
  cursorPosition: number
): PatientJourneyTimelineEvent<LID> | null => {
  return least(events, (event) => diff(event.startTimeMillis, cursorPosition)) ?? null
}

interface Props<LID extends string> extends PatientJourneyCustomLayerProps<LID> {
  cursorPosition: CursorPosition
  onHover: (eventId: EventId) => void
  onSelect: (eventId: EventId) => void
}

// TODO: This doesn't have to be a custom layer. Redux middleware?
export const TimelineCanvasMarksInteraction = <LID extends string>({
  events,
  cursorPosition,
  lanes,
  yScale,
  xScale,
  laneDisplayMode,
  height,
  onHover,
}: Props<LID>) => {
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
