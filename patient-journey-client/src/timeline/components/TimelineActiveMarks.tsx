import React from 'react'
import { useTheme } from '@mui/material'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EntityId, EntityIdNone } from '../../data/entities'

interface TimelineActiveMarksProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>
  extends CustomLayerProps<EID, LID, E> {
  selectedEvent: TimelineEvent<EID, LID> | undefined
  hoveredEvent: TimelineEvent<EID, LID> | undefined
  selectedColor: string
  onHover: (eventId: EntityId) => void
  onSelect: (eventId: EntityId) => void
}

export const TimelineActiveMarks = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  yScale,
  xScale,
  laneDisplayMode,
  height,
  selectedEvent,
  hoveredEvent,
  selectedColor,
  onHover,
  onSelect,
}: TimelineActiveMarksProps<EID, LID, E>) => {
  const theme = useTheme()

  // TODO: Share circle logic across all components
  const createCirce = (event: TimelineEvent<EID, LID>) => {
    const x = Math.round(xScale(event.startTimeMillis))
    const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId) ?? height / 2)

    return (
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={selectedColor}
        stroke={theme.palette.text.primary}
        strokeWidth={2}
        onClick={() => onSelect(event.eventId as EntityId)}
        onMouseEnter={() => onHover(event.eventId as EntityId)}
        onMouseLeave={() => onHover(EntityIdNone)}
      ></circle>
    )
  }

  return (
    <>
      {hoveredEvent && createCirce(hoveredEvent)}
      {selectedEvent && createCirce(selectedEvent)}
    </>
  )
}
