import React, { useMemo } from 'react'
import { darken, lighten, useTheme } from '@mui/material'

import { EntityId, EntityIdNone } from '../../data/entities'
import { calcMarkSize, SvgMark } from './SvgMark'
import { DARKENING_FACTOR, LIGHTENING_FACTOR } from '../../theme/useCustomTheme'
import { EventId } from '../../data/events'
import { PatientJourneyCustomLayerProps, PatientJourneyTimelineEvent } from './shared'

// drawing active mark slightly bigger, to pronounce interactivity (micro-animate the size-up?)
const TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR = 1.2

interface Props<LID extends string> extends PatientJourneyCustomLayerProps<LID> {
  selectedEvent: PatientJourneyTimelineEvent<LID> | undefined
  hoveredEvent: PatientJourneyTimelineEvent<LID> | undefined
  selectedColor: string
  onHover: (eventId: EventId) => void
  onSelect: (eventId: EventId) => void
}

export const TimelineActiveMarks = <LID extends string>({
  yScale,
  xScale,
  laneDisplayMode,
  height,
  selectedEvent,
  hoveredEvent,
  selectedColor,
  onHover,
  onSelect,
}: Props<LID>) => {
  const theme = useTheme()

  const laneHeight = yScale.bandwidth()
  const markSize = useMemo(
    () => TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR * calcMarkSize(laneDisplayMode, laneHeight),
    [laneDisplayMode, laneHeight]
  )

  const createCirce = (event: PatientJourneyTimelineEvent<LID>, color: string) => {
    const x = Math.round(xScale(event.startTimeMillis))
    const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId) ?? height / 2)

    return (
      <g transform={`translate(${x}, ${y})`}>
        <SvgMark
          size={markSize}
          color={color}
          stroke={theme.palette.mode === 'dark' ? lighten(color, LIGHTENING_FACTOR) : darken(color, DARKENING_FACTOR)}
          onClick={() => onSelect(event.eventId as EntityId)}
          onMouseEnter={() => onHover(event.eventId as EntityId)}
          onMouseLeave={() => onHover(EntityIdNone)}
        />
      </g>
    )
  }

  return (
    <>
      {hoveredEvent &&
        createCirce(
          hoveredEvent,
          theme.palette.mode === 'dark'
            ? darken(selectedColor, DARKENING_FACTOR)
            : lighten(selectedColor, LIGHTENING_FACTOR)
        )}
      {selectedEvent && createCirce(selectedEvent, selectedColor)}
    </>
  )
}
