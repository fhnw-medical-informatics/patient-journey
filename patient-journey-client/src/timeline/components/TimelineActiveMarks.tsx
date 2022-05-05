import React, { useMemo } from 'react'
import { darken, lighten, useTheme } from '@mui/material'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EntityId, EntityIdNone } from '../../data/entities'
import { calcMarkSize, SvgMark } from './SvgMark'

// drawing active mark slightly bigger, to pronounce interactivity (micro-animate the size-up?)
const TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR = 1.2

interface TimelineActiveMarksProps<
  EID extends string,
  PatientId extends string,
  E extends TimelineEvent<EID, PatientId>
> extends CustomLayerProps<EID, PatientId, E> {
  selectedEvent: TimelineEvent<EID, PatientId> | undefined
  hoveredEvent: TimelineEvent<EID, PatientId> | undefined
  selectedColor: string
  onHover: (eventId: EntityId) => void
  onSelect: (eventId: EntityId) => void
}

export const TimelineActiveMarks = <
  EID extends string,
  PatientId extends string,
  E extends TimelineEvent<EID, PatientId>
>({
  yScale,
  xScale,
  laneDisplayMode,
  height,
  selectedEvent,
  hoveredEvent,
  selectedColor,
  onHover,
  onSelect,
}: TimelineActiveMarksProps<EID, PatientId, E>) => {
  const theme = useTheme()

  const laneHeight = yScale.bandwidth()
  const markSize = useMemo(
    () => TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR * calcMarkSize(laneDisplayMode, laneHeight),
    [laneDisplayMode, laneHeight]
  )

  const createCirce = (event: TimelineEvent<EID, PatientId>, color: string) => {
    const x = Math.round(xScale(event.startTimeMillis))
    const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId) ?? height / 2)

    return (
      <g transform={`translate(${x}, ${y})`}>
        <SvgMark
          size={markSize}
          color={color}
          stroke={theme.palette.text.primary}
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
          theme.palette.mode === 'dark' ? darken(selectedColor, 0.6) : lighten(selectedColor, 0.8)
        )}
      {selectedEvent && createCirce(selectedEvent, selectedColor)}
    </>
  )
}
